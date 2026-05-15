import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

/**
 * GET /api/spending?user_id=...
 * Tính tổng chi tiêu từ shopping_items (purchased = true) và meal_plans (estimated_cost).
 * Trả về { total_vnd, breakdown: { shopping, meal_plans }, budget_vnd }
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabaseService) {
      return NextResponse.json({ message: 'Cấu hình máy chủ không hợp lệ' }, { status: 500 });
    }

    const userId = request.nextUrl.searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ message: 'user_id là bắt buộc' }, { status: 400 });
    }

    // Tìm partnership để lấy shopping_items
    const { data: partnershipData } = await supabaseService
      .from('partnerships')
      .select('id')
      .or(`mother_id.eq.${userId},father_id.eq.${userId}`)
      .eq('status', 'accepted')
      .limit(1);

    const partnershipId = partnershipData?.[0]?.id ?? null;

    // 1. Chi tiêu từ shopping_items (đã mua)
    let shoppingTotal = 0;
    if (partnershipId) {
      const { data: items } = await supabaseService
        .from('shopping_items')
        .select('price, quantity')
        .eq('partnership_id', partnershipId)
        .eq('purchased', true);

      shoppingTotal = (items ?? []).reduce(
        (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1),
        0
      );
    }

    // 2. Chi phí từ meal_plans (estimated_cost.total_vnd của tuần hiện tại)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data: plans } = await supabaseService
      .from('meal_plans')
      .select('estimated_cost, daily_budget_vnd')
      .eq('user_id', userId)
      .gte('plan_date', weekAgo.toISOString().split('T')[0]);

    let mealPlansTotal = 0;
    let budgetVnd = 0;
    for (const plan of plans ?? []) {
      // estimated_cost có thể là { total_vnd: number } hoặc số trực tiếp
      const cost = plan.estimated_cost;
      if (typeof cost === 'object' && cost !== null && 'total_vnd' in cost) {
        mealPlansTotal += cost.total_vnd ?? 0;
      } else if (typeof cost === 'number') {
        mealPlansTotal += cost;
      }
      if (plan.daily_budget_vnd) {
        budgetVnd += plan.daily_budget_vnd;
      }
    }

    const totalVnd = shoppingTotal + mealPlansTotal;

    return NextResponse.json({
      total_vnd: Math.round(totalVnd),
      breakdown: {
        shopping: Math.round(shoppingTotal),
        meal_plans: Math.round(mealPlansTotal),
      },
      budget_vnd: Math.round(budgetVnd),
    });
  } catch (error) {
    console.error('GET /api/spending error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
