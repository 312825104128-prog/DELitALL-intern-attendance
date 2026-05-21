export type Domain =
    | 'Web Development'
    | 'Marketing'
    | 'QA Testing'
    | 'UI/UX'
    | 'Data Science'
    | 'Mobile Development'
    | 'DevOps'
    | 'Other';

export type WorkStatus = 'Completed' | 'In Progress' | 'Blocked';
export type HoursContributed = '1-2 Hours' | '2-4 Hours' | '4-6 Hours' | '6+ Hours';

export interface Intern {
    id: string;
    name: string;
    email: string;
    domain: Domain;
    startDate: string;
    endDate: string;
    role: string;
    isAdmin: boolean;
    uid: string;
}

export interface Submission {
    id: string;
    internId: string;
    internName: string;
    email: string;
    domain: Domain;
    date: string;
    assignedTask: string;
    workStatus: WorkStatus;
    hoursContributed: HoursContributed;
    learningDetails: string;
    workCompleted: string;
    challengesFaced: string;
    supportRequired: string;
    uploadedFileUrl?: string;
    uploadedFileName?: string;
    submittedAt: string;
}

export interface AdminStats {
    totalInterns: number;
    submissionsToday: number;
    missingToday: number;
    totalSubmissions: number;
    domainBreakdown: Record<string, number>;
}
