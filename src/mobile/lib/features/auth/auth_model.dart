import '/components/auth_tab/auth_tab_widget.dart';
import '/components/button/button_widget.dart';
import '/components/role_card/role_card_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'login_and_role_selection_widget.dart' show LoginAndRoleSelectionWidget;
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class LoginAndRoleSelectionModel
    extends FlutterFlowModel<LoginAndRoleSelectionWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for AuthTab.
  late AuthTabModel authTabModel1;
  // Model for AuthTab.
  late AuthTabModel authTabModel2;
  // Model for TextField.
  late TextFieldModel textFieldModel1;
  // Model for TextField.
  late TextFieldModel textFieldModel2;
  // Model for Button.
  late ButtonModel buttonModel1;
  // Model for RoleCard.
  late RoleCardModel roleCardModel1;
  // Model for RoleCard.
  late RoleCardModel roleCardModel2;
  // Model for TextField.
  late TextFieldModel textFieldModel3;
  // Model for Button.
  late ButtonModel buttonModel2;
  // Model for Button.
  late ButtonModel buttonModel3;

  @override
  void initState(BuildContext context) {
    authTabModel1 = createModel(context, () => AuthTabModel());
    authTabModel2 = createModel(context, () => AuthTabModel());
    textFieldModel1 = createModel(context, () => TextFieldModel());
    textFieldModel2 = createModel(context, () => TextFieldModel());
    buttonModel1 = createModel(context, () => ButtonModel());
    roleCardModel1 = createModel(context, () => RoleCardModel());
    roleCardModel2 = createModel(context, () => RoleCardModel());
    textFieldModel3 = createModel(context, () => TextFieldModel());
    buttonModel2 = createModel(context, () => ButtonModel());
    buttonModel3 = createModel(context, () => ButtonModel());
  }

  @override
  void dispose() {
    authTabModel1.dispose();
    authTabModel2.dispose();
    textFieldModel1.dispose();
    textFieldModel2.dispose();
    buttonModel1.dispose();
    roleCardModel1.dispose();
    roleCardModel2.dispose();
    textFieldModel3.dispose();
    buttonModel2.dispose();
    buttonModel3.dispose();
  }
}
