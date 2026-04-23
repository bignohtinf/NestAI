import '/components/ai_combo_card/ai_combo_card_widget.dart';
import '/components/budget_stat_item/budget_stat_item_widget.dart';
import '/components/shopping_item/shopping_item_widget.dart';
import '/flutter_flow/flutter_flow_charts.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'nutri_mart_planner_widget.dart' show NutriMartPlannerWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class NutriMartPlannerModel extends FlutterFlowModel<NutriMartPlannerWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for BudgetStatItem.
  late BudgetStatItemModel budgetStatItemModel1;
  // Model for BudgetStatItem.
  late BudgetStatItemModel budgetStatItemModel2;
  // Model for AiComboCard.
  late AiComboCardModel aiComboCardModel;
  // Model for ShoppingItem.
  late ShoppingItemModel shoppingItemModel1;
  // Model for ShoppingItem.
  late ShoppingItemModel shoppingItemModel2;
  // Model for ShoppingItem.
  late ShoppingItemModel shoppingItemModel3;
  // Model for ShoppingItem.
  late ShoppingItemModel shoppingItemModel4;
  // Model for ShoppingItem.
  late ShoppingItemModel shoppingItemModel5;

  @override
  void initState(BuildContext context) {
    budgetStatItemModel1 = createModel(context, () => BudgetStatItemModel());
    budgetStatItemModel2 = createModel(context, () => BudgetStatItemModel());
    aiComboCardModel = createModel(context, () => AiComboCardModel());
    shoppingItemModel1 = createModel(context, () => ShoppingItemModel());
    shoppingItemModel2 = createModel(context, () => ShoppingItemModel());
    shoppingItemModel3 = createModel(context, () => ShoppingItemModel());
    shoppingItemModel4 = createModel(context, () => ShoppingItemModel());
    shoppingItemModel5 = createModel(context, () => ShoppingItemModel());
  }

  @override
  void dispose() {
    budgetStatItemModel1.dispose();
    budgetStatItemModel2.dispose();
    aiComboCardModel.dispose();
    shoppingItemModel1.dispose();
    shoppingItemModel2.dispose();
    shoppingItemModel3.dispose();
    shoppingItemModel4.dispose();
    shoppingItemModel5.dispose();
  }
}
