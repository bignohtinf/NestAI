import '/components/family_status/family_status_widget.dart';
import '/components/metric_card/metric_card_widget.dart';
import '/components/task_item/task_item_widget.dart';
import '/flutter_flow/flutter_flow_charts.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'father_dashboard_widget.dart' show FatherDashboardWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:provider/provider.dart';

class FatherDashboardModel extends FlutterFlowModel<FatherDashboardWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for FamilyStatus.
  late FamilyStatusModel familyStatusModel1;
  // Model for FamilyStatus.
  late FamilyStatusModel familyStatusModel2;
  // Model for MetricCard.
  late MetricCardModel metricCardModel1;
  // Model for MetricCard.
  late MetricCardModel metricCardModel2;
  // Model for TaskItem.
  late TaskItemModel taskItemModel1;
  // Model for TaskItem.
  late TaskItemModel taskItemModel2;
  // Model for TaskItem.
  late TaskItemModel taskItemModel3;

  @override
  void initState(BuildContext context) {
    familyStatusModel1 = createModel(context, () => FamilyStatusModel());
    familyStatusModel2 = createModel(context, () => FamilyStatusModel());
    metricCardModel1 = createModel(context, () => MetricCardModel());
    metricCardModel2 = createModel(context, () => MetricCardModel());
    taskItemModel1 = createModel(context, () => TaskItemModel());
    taskItemModel2 = createModel(context, () => TaskItemModel());
    taskItemModel3 = createModel(context, () => TaskItemModel());
  }

  @override
  void dispose() {
    familyStatusModel1.dispose();
    familyStatusModel2.dispose();
    metricCardModel1.dispose();
    metricCardModel2.dispose();
    taskItemModel1.dispose();
    taskItemModel2.dispose();
    taskItemModel3.dispose();
  }
}
