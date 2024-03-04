import { Input } from "antd";
const EMPTY_FUNC = () => {};
const FileInput = ({
  accept = "audio/*",
  onChange = EMPTY_FUNC
}) => {
  return <Input type="file" accept={accept} onChange={e => onChange(e.target.files)}></Input>;
};
export default FileInput;