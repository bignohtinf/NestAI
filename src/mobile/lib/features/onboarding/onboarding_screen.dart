import '/components/button/button_widget.dart';
import '/components/dot_indicator/dot_indicator_widget.dart';
import '/components/onboarding_step/onboarding_step_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'onboarding_model.dart';
export 'onboarding_model.dart';

class OnboardingWidget extends StatefulWidget {
  const OnboardingWidget({super.key});

  static String routeName = 'Onboarding';
  static String routePath = '/onboarding';

  @override
  State<OnboardingWidget> createState() => _OnboardingWidgetState();
}

class _OnboardingWidgetState extends State<OnboardingWidget> {
  late OnboardingModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => OnboardingModel());
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
        body: Column(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              height: 80,
              child: Padding(
                padding: EdgeInsetsDirectional.fromSTEB(24, 16, 24, 16),
                child: Container(
                  child: Container(
                    alignment: AlignmentDirectional(1, 0),
                    child: wrapWithModel(
                      model: _model.buttonModel1,
                      updateCallback: () => safeSetState(() {}),
                      child: ButtonWidget(
                        content: 'Skip',
                        icon_present: false,
                        icon_end_present: false,
                        color: FlutterFlowTheme.of(context).secondaryText,
                        on_tap: 'navigate:MotherDashboard',
                        variant: 'ghost',
                        size: 'medium',
                        full_width: false,
                        loading: false,
                        disabled: false,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              flex: 1,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  wrapWithModel(
                    model: _model.onboardingStepModel,
                    updateCallback: () => safeSetState(() {}),
                    child: OnboardingStepWidget(
                      description:
                          'Your intelligent companion for the beautiful journey of parenthood.',
                      lottie_desc:
                          'https://dimg.dreamflow.cloud/v1/lottie/happy+family+with+a+newborn+baby+animation',
                      title: 'Welcome to NestAI',
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      wrapWithModel(
                        model: _model.dotIndicatorModel1,
                        updateCallback: () => safeSetState(() {}),
                        child: DotIndicatorWidget(
                          active: true,
                        ),
                      ),
                      wrapWithModel(
                        model: _model.dotIndicatorModel2,
                        updateCallback: () => safeSetState(() {}),
                        child: DotIndicatorWidget(
                          active: false,
                        ),
                      ),
                      wrapWithModel(
                        model: _model.dotIndicatorModel3,
                        updateCallback: () => safeSetState(() {}),
                        child: DotIndicatorWidget(
                          active: false,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              decoration: BoxDecoration(
                color: FlutterFlowTheme.of(context).primaryBackground,
                shape: BoxShape.rectangle,
              ),
              child: Container(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        height: 56,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              FlutterFlowTheme.of(context).primary,
                              Colors.transparent
                            ],
                            stops: [0, 1],
                            begin: AlignmentDirectional(-1, 0),
                            end: AlignmentDirectional(1, 0),
                          ),
                          borderRadius: BorderRadius.circular(20),
                          shape: BoxShape.rectangle,
                        ),
                        child: wrapWithModel(
                          model: _model.buttonModel2,
                          updateCallback: () => safeSetState(() {}),
                          child: ButtonWidget(
                            content: 'Continue',
                            icon_present: false,
                            icon_end_present: false,
                            color: FlutterFlowTheme.of(context).secondaryText,
                            on_tap: 'navigate:LoginAndRoleSelection',
                            variant: 'primary',
                            size: 'medium',
                            full_width: true,
                            loading: false,
                            disabled: false,
                          ),
                        ),
                      ),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          'Already have an account?',
                          style: FlutterFlowTheme.of(context)
                              .bodyMedium
                              .override(
                                font: GoogleFonts.inter(
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .bodyMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .bodyMedium
                                      .fontStyle,
                                ),
                                color:
                                    FlutterFlowTheme.of(context).secondaryText,
                                letterSpacing: 0.0,
                                fontWeight: FlutterFlowTheme.of(context)
                                    .bodyMedium
                                    .fontWeight,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .bodyMedium
                                    .fontStyle,
                                lineHeight: 1.5,
                              ),
                        ),
                        wrapWithModel(
                          model: _model.buttonModel3,
                          updateCallback: () => safeSetState(() {}),
                          child: ButtonWidget(
                            content: 'Sign In',
                            icon_present: false,
                            icon_end_present: false,
                            color: FlutterFlowTheme.of(context).primary,
                            on_tap: 'navigate:LoginAndRoleSelection',
                            variant: 'ghost',
                            size: 'small',
                            full_width: false,
                            loading: false,
                            disabled: false,
                          ),
                        ),
                      ].divide(SizedBox(width: 4)),
                    ),
                  ].divide(SizedBox(height: 16)),
                ),
              ),
            ),
            Stack(
              alignment: AlignmentDirectional(-1, -1),
              children: [
                Align(
                  alignment: AlignmentDirectional(-1.2, -1.1),
                  child: Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      color: FlutterFlowTheme.of(context).primary5,
                      borderRadius: BorderRadius.circular(999),
                      shape: BoxShape.rectangle,
                    ),
                  ),
                ),
                Align(
                  alignment: AlignmentDirectional(1.3, 0.5),
                  child: Container(
                    width: 150,
                    height: 150,
                    decoration: BoxDecoration(
                      color: FlutterFlowTheme.of(context).accent10,
                      borderRadius: BorderRadius.circular(999),
                      shape: BoxShape.rectangle,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
