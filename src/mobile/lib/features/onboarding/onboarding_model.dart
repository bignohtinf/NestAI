import '/components/button/button_widget.dart';
import '/components/dot_indicator/dot_indicator_widget.dart';
import '/components/onboarding_step/onboarding_step_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'onboarding_widget.dart' show OnboardingWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class OnboardingModel extends FlutterFlowModel<OnboardingWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for Button.
  late ButtonModel buttonModel1;
  // Model for OnboardingStep.
  late OnboardingStepModel onboardingStepModel;
  // Model for DotIndicator.
  late DotIndicatorModel dotIndicatorModel1;
  // Model for DotIndicator.
  late DotIndicatorModel dotIndicatorModel2;
  // Model for DotIndicator.
  late DotIndicatorModel dotIndicatorModel3;
  // Model for Button.
  late ButtonModel buttonModel2;
  // Model for Button.
  late ButtonModel buttonModel3;

  @override
  void initState(BuildContext context) {
    buttonModel1 = createModel(context, () => ButtonModel());
    onboardingStepModel = createModel(context, () => OnboardingStepModel());
    dotIndicatorModel1 = createModel(context, () => DotIndicatorModel());
    dotIndicatorModel2 = createModel(context, () => DotIndicatorModel());
    dotIndicatorModel3 = createModel(context, () => DotIndicatorModel());
    buttonModel2 = createModel(context, () => ButtonModel());
    buttonModel3 = createModel(context, () => ButtonModel());
  }

  @override
  void dispose() {
    buttonModel1.dispose();
    onboardingStepModel.dispose();
    dotIndicatorModel1.dispose();
    dotIndicatorModel2.dispose();
    dotIndicatorModel3.dispose();
    buttonModel2.dispose();
    buttonModel3.dispose();
  }
}
