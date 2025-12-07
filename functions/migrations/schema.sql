CREATE TABLE public.merchants (
    id bigint NOT NULL,
    name text NOT NULL,
    provider text NOT NULL,
    provider_merchant_id text NOT NULL,
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    token_expires_at timestamp with time zone NOT NULL,
    token_scopes text[] DEFAULT ARRAY[]::text[] NOT NULL,
    locations jsonb DEFAULT '[]'::jsonb NOT NULL,
    connected_at timestamp with time zone DEFAULT now() NOT NULL,
    last_refreshed_at timestamp with time zone,
    revoked boolean DEFAULT false NOT NULL,
    scopes_mismatch boolean DEFAULT false NOT NULL,
    onboarding_completed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    refresh_failure_count integer DEFAULT 0 NOT NULL
);
CREATE TABLE public.pgmigrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);
