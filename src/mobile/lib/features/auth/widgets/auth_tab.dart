import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'auth_tab_model.dart';
export 'auth_tab_model.dart';

class AuthTabWidget extends StatefulWidget {
  const AuthTabWidget({
    super.key,
    String? label,
    bool? active,
  })  : this.label = label ?? 'Login',
        this.active = active ?? true;

  final String label;
  final bool active;

  @override
  State<AuthTabWidget> createState() => _AuthTabWidgetState();
}

class _AuthTabWidgetState extends State<AuthTabWidget> {
  late AuthTabModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => AuthTabModel());
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.rectangle,
      ),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Container(
          child: Container(
            alignment: AlignmentDirectional(0, 0),
            child: Text(
              valueOrDefault<String>(
                widget!.label,
                'Login',
              ),
              style: FlutterFlowTheme.of(context).labelLarge.override(
                    font: GoogleFonts.inter(
                      fontWeight:
                          FlutterFlowTheme.of(context).labelLarge.fontWeight,
                      fontStyle:
                          FlutterFlowTheme.of(context).labelLarge.fontStyle,
                    ),
                    color: widget!.active
                        ? FlutterFlowTheme.of(context).primary
                        : FlutterFlowTheme.of(context).secondaryText,
                    letterSpacing: 0.0,
                    fontWeight:
                        FlutterFlowTheme.of(context).labelLarge.fontWeight,
                    fontStyle:
                        FlutterFlowTheme.of(context).labelLarge.fontStyle,
                    lineHeight: 1.2,
                  ),
            ),
          ),
        ),
      ),
    );
  }
}
