import '/components/button/button_widget.dart';
import '/components/nutrition_card/nutrition_card_widget.dart';
import '/components/recipe_item/recipe_item_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'nutrition_and_recipes_widget.dart' show NutritionAndRecipesWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class NutritionAndRecipesModel
    extends FlutterFlowModel<NutritionAndRecipesWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for Button.
  late ButtonModel buttonModel;
  // Model for NutritionCard.
  late NutritionCardModel nutritionCardModel1;
  // Model for NutritionCard.
  late NutritionCardModel nutritionCardModel2;
  // Model for NutritionCard.
  late NutritionCardModel nutritionCardModel3;
  // Model for RecipeItem.
  late RecipeItemModel recipeItemModel1;
  // Model for RecipeItem.
  late RecipeItemModel recipeItemModel2;
  // Model for RecipeItem.
  late RecipeItemModel recipeItemModel3;

  @override
  void initState(BuildContext context) {
    buttonModel = createModel(context, () => ButtonModel());
    nutritionCardModel1 = createModel(context, () => NutritionCardModel());
    nutritionCardModel2 = createModel(context, () => NutritionCardModel());
    nutritionCardModel3 = createModel(context, () => NutritionCardModel());
    recipeItemModel1 = createModel(context, () => RecipeItemModel());
    recipeItemModel2 = createModel(context, () => RecipeItemModel());
    recipeItemModel3 = createModel(context, () => RecipeItemModel());
  }

  @override
  void dispose() {
    buttonModel.dispose();
    nutritionCardModel1.dispose();
    nutritionCardModel2.dispose();
    nutritionCardModel3.dispose();
    recipeItemModel1.dispose();
    recipeItemModel2.dispose();
    recipeItemModel3.dispose();
  }
}
