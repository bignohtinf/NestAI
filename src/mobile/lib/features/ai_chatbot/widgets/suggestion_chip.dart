import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'suggestion_chip_model.dart';
export 'suggestion_chip_model.dart';

class SuggestionChipWidget extends StatefulWidget {
  const SuggestionChipWidget({
    super.key,
    this.icon,
    String? label,
  }) : this.label = label ?? 'Thá»±c ÄÆ¡n tÄng sá»¯a';

  final Widget? icon;
  final String label;

  @override
  State<SuggestionChipWidget> createState() => _SuggestionChipWidgetState();
}

class _SuggestionChipWidgetState extends State<SuggestionChipWidget> {
  late SuggestionChipModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => SuggestionChipModel());
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsetsDirectional.fromSTEB(0, 0, 8, 0),
      child: Container(
        child: Container(
          decoration: BoxDecoration(
            color: FlutterFlowTheme.of(context).secondaryBackground,
            borderRadius: BorderRadius.circular(0),
            shape: BoxShape.rectangle,
            border: Border.all(
              color: Color(0xFFE8D5D0),
              width: 1,
            ),
          ),
          child: Padding(
            padding: EdgeInsetsDirectional.fromSTEB(16, 8, 16, 8),
            child: Container(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  widget!.icon!,
                  Text(
                    valueOrDefault<String>(
                      widget!.label,
                      'Thá»±c ÄÆ¡n tÄng sá»¯a',
                    ),
                    style: FlutterFlowTheme.of(context).labelMedium.override(
                          font: GoogleFonts.inter(
                            fontWeight: FlutterFlowTheme.of(context)
                                .labelMedium
                                .fontWeight,
                            fontStyle: FlutterFlowTheme.of(context)
                                .labelMedium
                                .fontStyle,
                          ),
                          color: FlutterFlowTheme.of(context).onSurface,
                          letterSpacing: 0.0,
                          fontWeight: FlutterFlowTheme.of(context)
                              .labelMedium
                              .fontWeight,
                          fontStyle: FlutterFlowTheme.of(context)
                              .labelMedium
                              .fontStyle,
                          lineHeight: 1.4,
                        ),
                  ),
                ].divide(SizedBox(width: 4)),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
