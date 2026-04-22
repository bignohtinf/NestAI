import '/components/feature_card/feature_card_widget.dart';
import '/components/quest_item/quest_item_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'mother_dashboard_widget.dart' show MotherDashboardWidget;
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:provider/provider.dart';

class MotherDashboardModel extends FlutterFlowModel<MotherDashboardWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for FeatureCard.
  late FeatureCardModel featureCardModel1;
  // Model for FeatureCard.
  late FeatureCardModel featureCardModel2;
  // Model for FeatureCard.
  late FeatureCardModel featureCardModel3;
  // Model for FeatureCard.
  late FeatureCardModel featureCardModel4;
  // Model for QuestItem.
  late QuestItemModel questItemModel1;
  // Model for QuestItem.
  late QuestItemModel questItemModel2;
  // Model for QuestItem.
  late QuestItemModel questItemModel3;

  @override
  void initState(BuildContext context) {
    featureCardModel1 = createModel(context, () => FeatureCardModel());
    featureCardModel2 = createModel(context, () => FeatureCardModel());
    featureCardModel3 = createModel(context, () => FeatureCardModel());
    featureCardModel4 = createModel(context, () => FeatureCardModel());
    questItemModel1 = createModel(context, () => QuestItemModel());
    questItemModel2 = createModel(context, () => QuestItemModel());
    questItemModel3 = createModel(context, () => QuestItemModel());
  }

  @override
  void dispose() {
    featureCardModel1.dispose();
    featureCardModel2.dispose();
    featureCardModel3.dispose();
    featureCardModel4.dispose();
    questItemModel1.dispose();
    questItemModel2.dispose();
    questItemModel3.dispose();
  }
}
