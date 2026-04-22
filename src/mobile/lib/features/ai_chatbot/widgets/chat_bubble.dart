import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'chat_bubble_model.dart';
export 'chat_bubble_model.dart';

class ChatBubbleWidget extends StatefulWidget {
  const ChatBubbleWidget({
    super.key,
    String? message,
    String? time,
    bool? is_sent,
  })  : this.message = message ??
            'ChÃ o Lan! ð MÃ¬nh lÃ  Nori. HÃ´m nay báº¡n cáº£m tháº¥y tháº¿ nÃ o? Báº¡n cÃ³ cáº§n mÃ¬nh tÆ° váº¥n thá»±c ÄÆ¡n Äá» tÄng cháº¥t lÆ°á»£ng sá»¯a khÃ´ng?',
        this.time = time ?? '09:41 AM',
        this.is_sent = is_sent ?? false;

  final String message;
  final String time;
  final bool is_sent;

  @override
  State<ChatBubbleWidget> createState() => _ChatBubbleWidgetState();
}

class _ChatBubbleWidgetState extends State<ChatBubbleWidget> {
  late ChatBubbleModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ChatBubbleModel());
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.max,
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        if (widget!.is_sent ? false : true)
          Container(
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: FlutterFlowTheme.of(context).accent13,
                borderRadius: BorderRadius.circular(999),
                shape: BoxShape.rectangle,
              ),
              alignment: AlignmentDirectional(0, 0),
              child: Icon(
                Icons.auto_awesome_rounded,
                color: FlutterFlowTheme.of(context).tertiary,
                size: 16,
              ),
            ),
          ),
        Expanded(
          flex: 1,
          child: Container(
            constraints: BoxConstraints(
              maxWidth: 300,
            ),
            decoration: BoxDecoration(
              color: widget!.is_sent
                  ? FlutterFlowTheme.of(context).primary
                  : Color(0xFFF2EBF8),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(valueOrDefault<double>(
                  widget!.is_sent ? 16.0 : 4.0,
                  0.0,
                )),
                topRight: Radius.circular(valueOrDefault<double>(
                  widget!.is_sent ? 16.0 : 16.0,
                  0.0,
                )),
                bottomLeft: Radius.circular(valueOrDefault<double>(
                  widget!.is_sent ? 16.0 : 16.0,
                  0.0,
                )),
                bottomRight: Radius.circular(valueOrDefault<double>(
                  widget!.is_sent ? 4.0 : 16.0,
                  0.0,
                )),
              ),
              shape: BoxShape.rectangle,
            ),
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Container(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      valueOrDefault<String>(
                        widget!.message,
                        'ChÃ o Lan! ð MÃ¬nh lÃ  Nori. HÃ´m nay báº¡n cáº£m tháº¥y tháº¿ nÃ o? Báº¡n cÃ³ cáº§n mÃ¬nh tÆ° váº¥n thá»±c ÄÆ¡n Äá» tÄng cháº¥t lÆ°á»£ng sá»¯a khÃ´ng?',
                      ),
                      style: FlutterFlowTheme.of(context).bodyMedium.override(
                            font: GoogleFonts.inter(
                              fontWeight: FlutterFlowTheme.of(context)
                                  .bodyMedium
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .bodyMedium
                                  .fontStyle,
                            ),
                            color: widget!.is_sent
                                ? FlutterFlowTheme.of(context).onPrimary
                                : FlutterFlowTheme.of(context).onSurface,
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
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          valueOrDefault<String>(
                            widget!.time,
                            '09:41 AM',
                          ),
                          style: FlutterFlowTheme.of(context)
                              .labelSmall
                              .override(
                                font: GoogleFonts.inter(
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .labelSmall
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .labelSmall
                                      .fontStyle,
                                ),
                                color: widget!.is_sent
                                    ? FlutterFlowTheme.of(context).onPrimary70
                                    : FlutterFlowTheme.of(context)
                                        .secondaryText60,
                                letterSpacing: 0.0,
                                fontWeight: FlutterFlowTheme.of(context)
                                    .labelSmall
                                    .fontWeight,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .labelSmall
                                    .fontStyle,
                                lineHeight: 1.3,
                              ),
                        ),
                      ],
                    ),
                  ].divide(SizedBox(height: 4)),
                ),
              ),
            ),
          ),
        ),
      ].divide(SizedBox(width: 16)),
    );
  }
}
