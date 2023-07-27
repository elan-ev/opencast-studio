import { COLORS } from "../util";


type ErrorBoxProps = {
  title?: string;
  body: string;
  extraBody?: string;
  className?: string;
};

export const ErrorBox: React.FC<ErrorBoxProps> = ({ title, body, extraBody, ...rest }) => (
  <div
    aria-live="polite"
    css={{
      padding: "16px 22px",
      margin: 12,
      borderRadius: 8,
      backgroundColor: COLORS.danger1,
      color: COLORS.danger5,
    }}
    {...rest}
  >
    {title && <strong css={{ display: "block", fontSize: 17, marginBottom: 8 }}>{title}</strong>}
    <div css={{ fontSize: 15, maxWidth: "100ch" }}>{body}</div>
    {extraBody && <div css={{ fontSize: 15, maxWidth: "100ch", marginTop: 8 }}>{extraBody}</div>}
  </div>
);
