import { Button, ButtonText } from "@gluestack-ui/themed";
import React from "react";

export default function PrimaryButton(
  props: React.ComponentProps<typeof Button>
) {
  const { children, ...rest } = props;
  return (
    <Button {...rest}>
      <ButtonText>
        {typeof children === "function" ? null : children}
      </ButtonText>
    </Button>
  );
}
