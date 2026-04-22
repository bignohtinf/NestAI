import '/components/button/button_widget.dart';
import '/components/chat_bubble/chat_bubble_widget.dart';
import '/components/suggestion_chip/suggestion_chip_widget.dart';
import '/components/text_field/text_field_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'nori_a_i_chatbot_widget.dart' show NoriAIChatbotWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

class NoriAIChatbotModel extends FlutterFlowModel<NoriAIChatbotWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for ChatBubble.
  late ChatBubbleModel chatBubbleModel1;
  // Model for ChatBubble.
  late ChatBubbleModel chatBubbleModel2;
  // Model for ChatBubble.
  late ChatBubbleModel chatBubbleModel3;
  // Model for Button.
  late ButtonModel buttonModel;
  // Model for SuggestionChip.
  late SuggestionChipModel suggestionChipModel1;
  // Model for SuggestionChip.
  late SuggestionChipModel suggestionChipModel2;
  // Model for SuggestionChip.
  late SuggestionChipModel suggestionChipModel3;
  // Model for SuggestionChip.
  late SuggestionChipModel suggestionChipModel4;
  // Model for TextField.
  late TextFieldModel textFieldModel;

  @override
  void initState(BuildContext context) {
    chatBubbleModel1 = createModel(context, () => ChatBubbleModel());
    chatBubbleModel2 = createModel(context, () => ChatBubbleModel());
    chatBubbleModel3 = createModel(context, () => ChatBubbleModel());
    buttonModel = createModel(context, () => ButtonModel());
    suggestionChipModel1 = createModel(context, () => SuggestionChipModel());
    suggestionChipModel2 = createModel(context, () => SuggestionChipModel());
    suggestionChipModel3 = createModel(context, () => SuggestionChipModel());
    suggestionChipModel4 = createModel(context, () => SuggestionChipModel());
    textFieldModel = createModel(context, () => TextFieldModel());
  }

  @override
  void dispose() {
    chatBubbleModel1.dispose();
    chatBubbleModel2.dispose();
    chatBubbleModel3.dispose();
    buttonModel.dispose();
    suggestionChipModel1.dispose();
    suggestionChipModel2.dispose();
    suggestionChipModel3.dispose();
    suggestionChipModel4.dispose();
    textFieldModel.dispose();
  }
}
