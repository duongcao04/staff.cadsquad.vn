import { PrismaService } from "@/providers/prisma/prisma.service";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

export class GetFinancialStatsQuery {
    constructor(public readonly range: 'monthly' | 'yearly') {}
}

@QueryHandler(GetFinancialStatsQuery)
export class GetFinancialStatsHandler implements IQueryHandler<GetFinancialStatsQuery> {
    constructor(private readonly prisma: PrismaService) {}

    async execute() {
        const transactions = await this.prisma.transaction.findMany({
            where: { status: 'COMPLETED' }
        });

        const revenue = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
            .filter(t => t.type === 'PAYOUT')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalRevenue: revenue,      // Tổng thu từ khách
            totalExpenses: expenses,    // Tổng chi cho Staff
            netProfit: revenue - expenses, // Lợi nhuận ròng
            cashFlowStatus: revenue > expenses ? 'POSITIVE' : 'NEGATIVE'
        };
    }
}