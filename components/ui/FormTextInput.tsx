import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Input,
  InputField,
} from "@gluestack-ui/themed";
import React from "react";

type Props = {
  label: string;
  value?: string;
  onChangeText?: (t: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export default function FormTextInput(props: Props) {
  return (
    <FormControl style={{ marginVertical: 8 }}>
      <FormControlLabel>
        <FormControlLabelText>{props.label}</FormControlLabelText>
      </FormControlLabel>
      <Input>
        <InputField
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          secureTextEntry={props.secureTextEntry}
          autoCapitalize={props.autoCapitalize ?? "none"}
        />
      </Input>
    </FormControl>
  );
}
