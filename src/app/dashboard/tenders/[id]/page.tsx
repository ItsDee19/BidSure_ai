import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import TenderDetails from '@/components/tender/TenderDetails';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function TenderResultPage({ params }: { params: { id: string } }) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Access Denied</div>;

    const tender = await db.tenderDocument.findUnique({
        where: { id: params.id },
        include: {
            clauses: true, // Fetch extracted clauses too
        }
    });

    if (!tender) notFound();

    // Security check
    if (tender.userId !== user.id) return <div>Access Denied</div>;

    return <TenderDetails initialData={tender as any} />;
}
