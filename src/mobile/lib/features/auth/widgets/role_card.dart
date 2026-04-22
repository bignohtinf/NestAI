import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'role_card_model.dart';
export 'role_card_model.dart';

class RoleCardWidget extends StatefulWidget {
  const RoleCardWidget({
    super.key,
    String? desc,
    String? emoji,
    String? title,
    bool? selected,
  })  : this.desc = desc ?? 'Track health, milk, and recovery',
        this.emoji = emoji ?? 'ð¤±',
        this.title = title ?? 'Mother',
        this.selected = selected ?? true;

  final String desc;
  final String emoji;
  final String title;
  final bool selected;

  @override
  State<RoleCardWidget> createState() => _RoleCardWidgetState();
}

class _RoleCardWidgetState extends State<RoleCardWidget> {
  late RoleCardModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => RoleCardModel());
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: Container(
        decoration: BoxDecoration(
          color: FlutterFlowTheme.of(context).secondaryBackground,
          borderRadius: BorderRadius.circular(24),
          shape: BoxShape.rectangle,
          border: Border.all(
            color: widget!.selected
                ? FlutterFlowTheme.of(context).primary
                : FlutterFlowTheme.of(context).alternate,
            width: widget!.selected ? 2.0 : 2.0,
          ),
        ),
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Container(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: widget!.selected
                        ? FlutterFlowTheme.of(context).primary10
                        : FlutterFlowTheme.of(context).primaryBackground,
                    borderRadius: BorderRadius.circular(999),
                    shape: BoxShape.rectangle,
                  ),
                  alignment: AlignmentDirectional(0, 0),
                  child: Text(
                    valueOrDefault<String>(
                      widget!.emoji,
                      'ð¤±',
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
                          fontSize: 32,
                          letterSpacing: 0.0,
                          fontWeight: FlutterFlowTheme.of(context)
                              .bodyMedium
                              .fontWeight,
                          fontStyle:
                              FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                          lineHeight: 1.5,
                        ),
                  ),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      valueOrDefault<String>(
                        widget!.title,
                        'Mother',
                      ),
                      style: FlutterFlowTheme.of(context).titleMedium.override(
                            font: GoogleFonts.inter(
                              fontWeight: FontWeight.bold,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .titleMedium
                                  .fontStyle,
                            ),
                            color: widget!.selected
                                ? FlutterFlowTheme.of(context).primary
                                : FlutterFlowTheme.of(context).primaryText,
                            letterSpacing: 0.0,
                            fontWeight: FontWeight.bold,
                            fontStyle: FlutterFlowTheme.of(context)
                                .titleMedium
                                .fontStyle,
                            lineHeight: 1.35,
                          ),
                    ),
                    Text(
                      valueOrDefault<String>(
                        widget!.desc,
                        'Track health, milk, and recovery',
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      style: FlutterFlowTheme.of(context).labelSmall.override(
                            font: GoogleFonts.inter(
                              fontWeight: FlutterFlowTheme.of(context)
                                  .labelSmall
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .labelSmall
                                  .fontStyle,
                            ),
                            color: FlutterFlowTheme.of(context).secondaryText,
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
                  ].divide(SizedBox(height: 4)),
                ),
              ].divide(SizedBox(height: 16)),
            ),
          ),
        ),
      ),
    );
  }
}
