import '/components/baby_header/baby_header_widget.dart';
import '/components/button/button_widget.dart';
import '/components/milestone_card/milestone_card_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'baby_journey_timeline_widget.dart' show BabyJourneyTimelineWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class BabyJourneyTimelineModel
    extends FlutterFlowModel<BabyJourneyTimelineWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for BabyHeader.
  late BabyHeaderModel babyHeaderModel;
  // Model for MilestoneCard.
  late MilestoneCardModel milestoneCardModel1;
  // Model for MilestoneCard.
  late MilestoneCardModel milestoneCardModel2;
  // Model for MilestoneCard.
  late MilestoneCardModel milestoneCardModel3;
  // Model for MilestoneCard.
  late MilestoneCardModel milestoneCardModel4;
  // Model for Button.
  late ButtonModel buttonModel;

  @override
  void initState(BuildContext context) {
    babyHeaderModel = createModel(context, () => BabyHeaderModel());
    milestoneCardModel1 = createModel(context, () => MilestoneCardModel());
    milestoneCardModel2 = createModel(context, () => MilestoneCardModel());
    milestoneCardModel3 = createModel(context, () => MilestoneCardModel());
    milestoneCardModel4 = createModel(context, () => MilestoneCardModel());
    buttonModel = createModel(context, () => ButtonModel());
  }

  @override
  void dispose() {
    babyHeaderModel.dispose();
    milestoneCardModel1.dispose();
    milestoneCardModel2.dispose();
    milestoneCardModel3.dispose();
    milestoneCardModel4.dispose();
    buttonModel.dispose();
  }
}
