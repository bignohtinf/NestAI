import '/components/button/button_widget.dart';
import '/components/chat_bubble/chat_bubble_widget.dart';
import '/components/suggestion_chip/suggestion_chip_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

import 'nori_a_i_chatbot_model.dart';
export 'nori_a_i_chatbot_model.dart';

class NoriAIChatbotWidget extends StatefulWidget {
  const NoriAIChatbotWidget({super.key});

  static String routeName = 'NoriAIChatbot';
  static String routePath = '/noriAIChatbot';

  @override
  State<NoriAIChatbotWidget> createState() => _NoriAIChatbotWidgetState();
}

class _NoriAIChatbotWidgetState extends State<NoriAIChatbotWidget> {
  late NoriAIChatbotModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => NoriAIChatbotModel());
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
              decoration: BoxDecoration(
                color: FlutterFlowTheme.of(context).secondaryBackground,
                shape: BoxShape.rectangle,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Padding(
                    padding: EdgeInsetsDirectional.fromSTEB(24, 48, 24, 16),
                    child: Container(
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              FlutterFlowIconButton(
                                borderRadius: 8,
                                buttonSize: 40,
                                fillColor: Colors.transparent,
                                icon: Icon(
                                  Icons.arrow_back_ios_new_rounded,
                                  color:
                                      FlutterFlowTheme.of(context).primaryText,
                                  size: 20,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisSize: MainAxisSize.max,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      Text(
                                        'Nori AI',
                                        style: FlutterFlowTheme.of(context)
                                            .titleMedium
                                            .override(
                                              font: GoogleFonts.inter(
                                                fontWeight: FontWeight.bold,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .titleMedium
                                                        .fontStyle,
                                              ),
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .tertiary,
                                              letterSpacing: 0.0,
                                              fontWeight: FontWeight.bold,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleMedium
                                                      .fontStyle,
                                              lineHeight: 1.35,
                                            ),
                                      ),
                                      Container(
                                        width: 8,
                                        height: 8,
                                        decoration: BoxDecoration(
                                          color: FlutterFlowTheme.of(context)
                                              .success,
                                          borderRadius:
                                              BorderRadius.circular(999),
                                          shape: BoxShape.rectangle,
                                        ),
                                      ),
                                    ].divide(SizedBox(width: 4)),
                                  ),
                                  Text(
                                    'Trá»£ lÃ½ dinh dÆ°á»¡ng thÃ´ng minh',
                                    style: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .override(
                                          font: GoogleFonts.inter(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(context)
                                              .secondaryText,
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .labelSmall
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .labelSmall
                                                  .fontStyle,
                                          lineHeight: 1.3,
                                        ),
                                  ),
                                ],
                              ),
                            ].divide(SizedBox(width: 16)),
                          ),
                          FlutterFlowIconButton(
                            borderRadius: 8,
                            buttonSize: 40,
                            fillColor: Colors.transparent,
                            icon: Icon(
                              Icons.history_rounded,
                              color: FlutterFlowTheme.of(context).secondaryText,
                              size: 22,
                            ),
                            onPressed: () {
                              print('IconButton pressed ...');
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                  Container(
                    height: 1,
                    decoration: BoxDecoration(
                      color: FlutterFlowTheme.of(context).alternate,
                      shape: BoxShape.rectangle,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 1,
              child: Container(
                child: SingleChildScrollView(
                  primary: false,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Padding(
                        padding: EdgeInsets.all(24),
                        child: Container(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              wrapWithModel(
                                model: _model.chatBubbleModel1,
                                updateCallback: () => safeSetState(() {}),
                                child: ChatBubbleWidget(
                                  message:
                                      'ChÃ o Lan! ð MÃ¬nh lÃ  Nori. HÃ´m nay báº¡n cáº£m tháº¥y tháº¿ nÃ o? Báº¡n cÃ³ cáº§n mÃ¬nh tÆ° váº¥n thá»±c ÄÆ¡n Äá» tÄng cháº¥t lÆ°á»£ng sá»¯a khÃ´ng?',
                                  time: '09:41 AM',
                                  is_sent: false,
                                ),
                              ),
                              wrapWithModel(
                                model: _model.chatBubbleModel2,
                                updateCallback: () => safeSetState(() {}),
                                child: ChatBubbleWidget(
                                  message:
                                      'MÃ¬nh muá»n há»i vá» cÃ¡c loáº¡i thá»±c pháº©m giÃºp bÃ© phÃ¡t triá»n trÃ­ nÃ£o qua sá»¯a máº¹.',
                                  time: '09:42 AM',
                                  is_sent: true,
                                ),
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  wrapWithModel(
                                    model: _model.chatBubbleModel3,
                                    updateCallback: () => safeSetState(() {}),
                                    child: ChatBubbleWidget(
                                      message:
                                          'Äá» giÃºp bÃ© phÃ¡t triá»n trÃ­ nÃ£o (DHA), Lan nÃªn bá» sung cÃ¡c thá»±c pháº©m giÃ u Omega-3 nhÃ©:',
                                      time: '09:42 AM',
                                      is_sent: false,
                                    ),
                                  ),
                                  Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        40, 0, 0, 0),
                                    child: Container(
                                      child: Container(
                                        decoration: BoxDecoration(
                                          color: FlutterFlowTheme.of(context)
                                              .secondaryBackground,
                                          borderRadius:
                                              BorderRadius.circular(20),
                                          shape: BoxShape.rectangle,
                                          border: Border.all(
                                            color: FlutterFlowTheme.of(context)
                                                .alternate,
                                            width: 1,
                                          ),
                                        ),
                                        child: Padding(
                                          padding: EdgeInsets.all(16),
                                          child: Container(
                                            child: Column(
                                              mainAxisSize: MainAxisSize.min,
                                              mainAxisAlignment:
                                                  MainAxisAlignment.start,
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  mainAxisSize:
                                                      MainAxisSize.max,
                                                  mainAxisAlignment:
                                                      MainAxisAlignment.start,
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.center,
                                                  children: [
                                                    Container(
                                                      width: 4,
                                                      height: 20,
                                                      decoration: BoxDecoration(
                                                        color:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .tertiary,
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(2),
                                                        shape:
                                                            BoxShape.rectangle,
                                                      ),
                                                    ),
                                                    Text(
                                                      'Gá»£i Ã½ tá»« Nori',
                                                      style: FlutterFlowTheme
                                                              .of(context)
                                                          .labelLarge
                                                          .override(
                                                            font: GoogleFonts
                                                                .inter(
                                                              fontWeight:
                                                                  FontWeight
                                                                      .bold,
                                                              fontStyle:
                                                                  FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelLarge
                                                                      .fontStyle,
                                                            ),
                                                            color: FlutterFlowTheme
                                                                    .of(context)
                                                                .tertiary,
                                                            letterSpacing: 0.0,
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            fontStyle:
                                                                FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelLarge
                                                                    .fontStyle,
                                                            lineHeight: 1.2,
                                                          ),
                                                    ),
                                                  ].divide(SizedBox(width: 8)),
                                                ),
                                                Text(
                                                  'â¢ CÃ¡ há»i: GiÃ u DHA & EPA\nâ¢ Trá»©ng gÃ : Chá»©a Choline cá»±c tá»t\nâ¢ Háº¡t Ã³c chÃ³: Omega-3 thá»±c váº­t\nâ¢ Rau xanh Äáº­m: Axit folic',
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .bodyMedium
                                                      .override(
                                                        font: GoogleFonts.inter(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .bodyMedium
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .bodyMedium
                                                                  .fontStyle,
                                                        ),
                                                        color:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .primaryText,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .fontStyle,
                                                        lineHeight: 1.5,
                                                      ),
                                                ),
                                                Divider(
                                                  height: 16,
                                                  thickness: 1,
                                                  indent: 0,
                                                  endIndent: 0,
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .alternate,
                                                ),
                                                wrapWithModel(
                                                  model: _model.buttonModel,
                                                  updateCallback: () =>
                                                      safeSetState(() {}),
                                                  child: ButtonWidget(
                                                    content:
                                                        'Xem cÃ´ng thá»©c cÃ¡ há»i',
                                                    icon: Icon(
                                                      Icons.restaurant_rounded,
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .primary,
                                                      size: 16,
                                                    ),
                                                    icon_present: true,
                                                    icon_end_present: false,
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .tertiary,
                                                    on_tap:
                                                        'navigate:MotherDashboard',
                                                    variant: 'ghost',
                                                    size: 'small',
                                                    full_width: false,
                                                    loading: false,
                                                    disabled: false,
                                                  ),
                                                ),
                                              ].divide(SizedBox(height: 8)),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ].divide(SizedBox(height: 16)),
                              ),
                              Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Container(
                                    width: 32,
                                    height: 32,
                                    decoration: BoxDecoration(
                                      color:
                                          FlutterFlowTheme.of(context).accent7,
                                      borderRadius: BorderRadius.circular(999),
                                      shape: BoxShape.rectangle,
                                    ),
                                    alignment: AlignmentDirectional(0, 0),
                                    child: Icon(
                                      Icons.auto_awesome_rounded,
                                      color: FlutterFlowTheme.of(context)
                                          .onPrimary,
                                      size: 16,
                                    ),
                                  ),
                                  Container(
                                    decoration: BoxDecoration(
                                      color: Color(0xFFF2EBF8),
                                      borderRadius: BorderRadius.only(
                                        topLeft: Radius.circular(4),
                                        topRight: Radius.circular(16),
                                        bottomLeft: Radius.circular(16),
                                        bottomRight: Radius.circular(16),
                                      ),
                                      shape: BoxShape.rectangle,
                                    ),
                                    child: Padding(
                                      padding: EdgeInsets.all(16),
                                      child: Container(
                                        child: Lottie.network(
                                          'https://dimg.dreamflow.cloud/v1/lottie/three+jumping+dots+loading+animation',
                                          width: 40,
                                          height: 20,
                                          fit: BoxFit.contain,
                                          animate: true,
                                        ),
                                      ),
                                    ),
                                  ),
                                ].divide(SizedBox(width: 16)),
                              ),
                            ].divide(SizedBox(height: 24)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Container(
              decoration: BoxDecoration(
                color: FlutterFlowTheme.of(context).secondaryBackground,
                shape: BoxShape.rectangle,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    height: 1,
                    decoration: BoxDecoration(
                      color: FlutterFlowTheme.of(context).alternate,
                      shape: BoxShape.rectangle,
                    ),
                  ),
                  Padding(
                    padding: EdgeInsetsDirectional.fromSTEB(24, 16, 24, 16),
                    child: Container(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                wrapWithModel(
                                  model: _model.suggestionChipModel1,
                                  updateCallback: () => safeSetState(() {}),
                                  child: SuggestionChipWidget(
                                    icon: Icon(
                                      Icons.restaurant_rounded,
                                      color:
                                          FlutterFlowTheme.of(context).tertiary,
                                      size: 14,
                                    ),
                                    label: 'Thá»±c ÄÆ¡n tÄng sá»¯a',
                                  ),
                                ),
                                wrapWithModel(
                                  model: _model.suggestionChipModel2,
                                  updateCallback: () => safeSetState(() {}),
                                  child: SuggestionChipWidget(
                                    icon: Icon(
                                      Icons.fitness_center_rounded,
                                      color:
                                          FlutterFlowTheme.of(context).tertiary,
                                      size: 14,
                                    ),
                                    label: 'BÃ i táº­p nháº¹ nhÃ ng',
                                  ),
                                ),
                                wrapWithModel(
                                  model: _model.suggestionChipModel3,
                                  updateCallback: () => safeSetState(() {}),
                                  child: SuggestionChipWidget(
                                    icon: Icon(
                                      Icons.local_hospital_rounded,
                                      color:
                                          FlutterFlowTheme.of(context).tertiary,
                                      size: 14,
                                    ),
                                    label: 'KhÃ¡m Äá»nh ká»³',
                                  ),
                                ),
                                wrapWithModel(
                                  model: _model.suggestionChipModel4,
                                  updateCallback: () => safeSetState(() {}),
                                  child: SuggestionChipWidget(
                                    icon: Icon(
                                      Icons.baby_changing_station_rounded,
                                      color:
                                          FlutterFlowTheme.of(context).tertiary,
                                      size: 14,
                                    ),
                                    label: 'Sá»©c khá»e cá»§a bÃ©',
                                  ),
                                ),
                              ].divide(SizedBox(width: 8)),
                            ),
                          ),
                          Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Expanded(
                                flex: 1,
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Color(0xFFF5EDE8),
                                    borderRadius: BorderRadius.circular(24),
                                    shape: BoxShape.rectangle,
                                  ),
                                  child: Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        16, 4, 16, 4),
                                    child: Container(
                                      child: wrapWithModel(
                                        model: _model.textFieldModel,
                                        updateCallback: () =>
                                            safeSetState(() {}),
                                        child: TextFieldWidget(
                                          label: false,
                                          helper: false,
                                          hint: 'Há»i Nori vá» dinh dÆ°á»¡ng...',
                                          value: '',
                                          leading_icon: Icon(
                                            Icons.search_rounded,
                                            color: FlutterFlowTheme.of(context)
                                                .primaryText,
                                            size: 16,
                                          ),
                                          leading_icon_present: true,
                                          trailing_icon_present: false,
                                          variant: 'ghost',
                                          error: false,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: FlutterFlowTheme.of(context).tertiary,
                                  borderRadius: BorderRadius.circular(999),
                                  shape: BoxShape.rectangle,
                                ),
                                alignment: AlignmentDirectional(0, 0),
                                child: Icon(
                                  Icons.send_rounded,
                                  color: FlutterFlowTheme.of(context).onPrimary,
                                  size: 20,
                                ),
                              ),
                            ].divide(SizedBox(width: 16)),
                          ),
                        ].divide(SizedBox(height: 16)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
