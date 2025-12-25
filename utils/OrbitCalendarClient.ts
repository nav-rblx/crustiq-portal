export type OrbitSessionStatus =
    | 'scheduled'
    | 'in-progress'
    | 'ended'
    | 'missed';

export interface OrbitSession {
    id: string;
    name: string;
    date: string;
    status: OrbitSessionStatus;
    type: {
        description: string;
        category: string;
        gameId: number | null;
        slots: number;
    };
    host: {
        userId: number;
        username: string;
        thumbnail: string | null;
    } | null;
    participants: any[];
}

export class OrbitCalendarClient {
    private baseUrl = process.env.ORBIT_API_URL!;
    private apiKey = process.env.ORBIT_API_KEY!;

    async getSessions(workspaceId: number): Promise<OrbitSession[]> {
        const now = new Date();
        const future = new Date();
        future.setDate(now.getDate() + 14);

        const url =
            `${this.baseUrl}/public/v1/workspace/${workspaceId}/sessions/calendar` +
            `?startDate=${now.toISOString()}&endDate=${future.toISOString()}`;

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error('Failed to fetch sessions');
        }

        return data.sessions as OrbitSession[];
    }
}
