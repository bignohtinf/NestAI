import '/components/benefit_item/benefit_item_widget.dart';
import '/components/button/button_widget.dart';
import '/components/nutrition_metric/nutrition_metric_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'smart_scan_widget.dart' show SmartScanWidget;
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

class SmartScanModel extends FlutterFlowModel<SmartScanWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for NutritionMetric.
  late NutritionMetricModel nutritionMetricModel1;
  // Model for NutritionMetric.
  late NutritionMetricModel nutritionMetricModel2;
  // Model for NutritionMetric.
  late NutritionMetricModel nutritionMetricModel3;
  // Model for NutritionMetric.
  late NutritionMetricModel nutritionMetricModel4;
  // Model for BenefitItem.
  late BenefitItemModel benefitItemModel1;
  // Model for BenefitItem.
  late BenefitItemModel benefitItemModel2;
  // Model for BenefitItem.
  late BenefitItemModel benefitItemModel3;
  // Model for Button.
  late ButtonModel buttonModel1;
  // Model for Button.
  late ButtonModel buttonModel2;

  @override
  void initState(BuildContext context) {
    nutritionMetricModel1 = createModel(context, () => NutritionMetricModel());
    nutritionMetricModel2 = createModel(context, () => NutritionMetricModel());
    nutritionMetricModel3 = createModel(context, () => NutritionMetricModel());
    nutritionMetricModel4 = createModel(context, () => NutritionMetricModel());
    benefitItemModel1 = createModel(context, () => BenefitItemModel());
    benefitItemModel2 = createModel(context, () => BenefitItemModel());
    benefitItemModel3 = createModel(context, () => BenefitItemModel());
    buttonModel1 = createModel(context, () => ButtonModel());
    buttonModel2 = createModel(context, () => ButtonModel());
  }

  @override
  void dispose() {
    nutritionMetricModel1.dispose();
    nutritionMetricModel2.dispose();
    nutritionMetricModel3.dispose();
    nutritionMetricModel4.dispose();
    benefitItemModel1.dispose();
    benefitItemModel2.dispose();
    benefitItemModel3.dispose();
    buttonModel1.dispose();
    buttonModel2.dispose();
  }
}
