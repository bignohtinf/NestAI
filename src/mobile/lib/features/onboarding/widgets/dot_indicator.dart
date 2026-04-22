import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'dot_indicator_model.dart';
export 'dot_indicator_model.dart';

class DotIndicatorWidget extends StatefulWidget {
  const DotIndicatorWidget({
    super.key,
    bool? active,
  }) : this.active = active ?? true;

  final bool active;

  @override
  State<DotIndicatorWidget> createState() => _DotIndicatorWidgetState();
}

class _DotIndicatorWidgetState extends State<DotIndicatorWidget> {
  late DotIndicatorModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => DotIndicatorModel());
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsetsDirectional.fromSTEB(4, 0, 4, 0),
      child: Container(
        child: Container(
          width: widget!.active ? 24.0 : 8.0,
          height: 8,
          decoration: BoxDecoration(
            color: widget!.active
                ? FlutterFlowTheme.of(context).primary
                : FlutterFlowTheme.of(context).alternate,
            borderRadius: BorderRadius.circular(999),
            shape: BoxShape.rectangle,
          ),
        ),
      ),
    );
  }
}
