import '/components/button/button_widget.dart';
import '/components/medical_record_item/medical_record_item_widget.dart';
import '/components/trend_stat_card/trend_stat_card_widget.dart';
import '/flutter_flow/flutter_flow_charts.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'health_trends_widget.dart' show HealthTrendsWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

class HealthTrendsModel extends FlutterFlowModel<HealthTrendsWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for TrendStatCard.
  late TrendStatCardModel trendStatCardModel1;
  // Model for TrendStatCard.
  late TrendStatCardModel trendStatCardModel2;
  // Model for Button.
  late ButtonModel buttonModel;
  // Model for MedicalRecordItem.
  late MedicalRecordItemModel medicalRecordItemModel1;
  // Model for MedicalRecordItem.
  late MedicalRecordItemModel medicalRecordItemModel2;
  // Model for MedicalRecordItem.
  late MedicalRecordItemModel medicalRecordItemModel3;

  @override
  void initState(BuildContext context) {
    trendStatCardModel1 = createModel(context, () => TrendStatCardModel());
    trendStatCardModel2 = createModel(context, () => TrendStatCardModel());
    buttonModel = createModel(context, () => ButtonModel());
    medicalRecordItemModel1 =
        createModel(context, () => MedicalRecordItemModel());
    medicalRecordItemModel2 =
        createModel(context, () => MedicalRecordItemModel());
    medicalRecordItemModel3 =
        createModel(context, () => MedicalRecordItemModel());
  }

  @override
  void dispose() {
    trendStatCardModel1.dispose();
    trendStatCardModel2.dispose();
    buttonModel.dispose();
    medicalRecordItemModel1.dispose();
    medicalRecordItemModel2.dispose();
    medicalRecordItemModel3.dispose();
  }
}
