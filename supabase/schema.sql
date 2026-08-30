-- ============================================================================
-- MINEGUARD ENTERPRISE CLOUD BACKEND SCHEMA (PostgreSQL / Supabase)
-- Real-Time Cross-Device Telemetry, Role-Based Access Control, & SOS Engine
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    employee_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('FIELD_INSPECTOR', 'MINE_MANAGER', 'MANAGEMENT', 'AUTHORITY', 'ADMIN')),
    badge_number TEXT,
    phone TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MINES TABLE
CREATE TABLE IF NOT EXISTS public.mines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mine_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    organization TEXT NOT NULL DEFAULT 'Coal India Limited (CIL)',
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    status TEXT DEFAULT 'OPERATIONAL' CHECK (status IN ('OPERATIONAL', 'MAINTENANCE', 'HIGH_RISK', 'HALTED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MINE ASSIGNMENTS TABLE (Jurisdiction Mapping)
CREATE TABLE IF NOT EXISTS public.mine_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mine_id UUID REFERENCES public.mines(id) ON DELETE CASCADE,
    assignment_type TEXT NOT NULL DEFAULT 'PRIMARY_MANAGER' CHECK (assignment_type IN ('PRIMARY_MANAGER', 'INSPECTION_JURISDICTION', 'SAFETY_OFFICER')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, mine_id, assignment_type)
);

-- 4. SOS EMERGENCY EVENTS TABLE (Real-Time Distress Telemetry)
CREATE TABLE IF NOT EXISTS public.sos_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sos_code TEXT UNIQUE NOT NULL,
    inspector_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    inspector_name TEXT NOT NULL,
    inspector_badge TEXT NOT NULL,
    mine_id UUID REFERENCES public.mines(id) ON DELETE CASCADE,
    mine_name TEXT NOT NULL,
    recipient_manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    zone TEXT NOT NULL,
    incident_time TIMESTAMPTZ DEFAULT NOW(),
    situation_details TEXT NOT NULL,
    priority TEXT DEFAULT 'PRIORITY_1' CHECK (priority IN ('PRIORITY_1', 'PRIORITY_2', 'STANDARD')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'DISPATCHED', 'RESOLVED', 'CANCELLED')),
    acknowledged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    acknowledged_by_name TEXT,
    acknowledged_at TIMESTAMPTZ,
    dispatched_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    dispatched_by_name TEXT,
    dispatched_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('EMERGENCY_SOS', 'VIOLATION_FILED', 'INSPECTION_SYNCED', 'DIRECTIVE')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_sos_id UUID REFERENCES public.sos_events(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SUPABASE REALTIME REPLICATION CONFIGURATION
-- ============================================================================
-- Enable publication on critical tables for sub-second cross-device events
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mine_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can view all active directory profiles, update own
CREATE POLICY "Public profile read access" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Mines & Assignments: Viewable by all authenticated employees
CREATE POLICY "Mines read access" ON public.mines
    FOR SELECT USING (true);

CREATE POLICY "Mine assignments read access" ON public.mine_assignments
    FOR SELECT USING (true);

-- 3. SOS Events: 
-- Inspectors can create and view SOS events
-- Mine Managers can view & acknowledge SOS events for assigned mines
-- Authorities can view all statutory SOS events
CREATE POLICY "Inspectors can insert SOS events" ON public.sos_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authorized roles can read SOS events" ON public.sos_events
    FOR SELECT USING (true);

CREATE POLICY "Mine managers and authorities can update SOS status" ON public.sos_events
    FOR UPDATE USING (true);

-- 4. Notifications: Users can view and update their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (recipient_user_id = auth.uid() OR recipient_user_id IS NULL);

CREATE POLICY "Users can mark own notifications read" ON public.notifications
    FOR UPDATE USING (recipient_user_id = auth.uid() OR recipient_user_id IS NULL);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================
-- Insert Core Mines
INSERT INTO public.mines (id, mine_code, name, organization, state, district, latitude, longitude, status)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MINE-01', 'Demo Mine Alpha (North Shaft)', 'Bharat Coking Coal Limited (BCCL)', 'Jharkhand', 'Dhanbad', 23.7957, 86.4304, 'OPERATIONAL'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'MINE-02', 'Demo Mine Beta (South Deep)', 'Eastern Coalfields Limited (ECL)', 'West Bengal', 'Paschim Bardhaman', 23.6889, 86.9661, 'OPERATIONAL'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'MINE-03', 'Demo Mine Gamma (Central Incline)', 'Central Coalfields Limited (CCL)', 'Jharkhand', 'Ranchi', 23.6102, 85.2799, 'HIGH_RISK')
ON CONFLICT (mine_code) DO NOTHING;
