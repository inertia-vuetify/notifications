export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface SharedPageProps {
    name: string;
    quote: { message: string; author: string };
    auth: { user: User | null };
}
