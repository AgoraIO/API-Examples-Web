import { Row, Col } from "antd";
const Responsive = ({
  children,
  style = {}
}) => {
  const ItemSpan = 24 / children.length;
  const clientWidth = document.body.clientWidth;
  const isInMobile = clientWidth < 576;
  return <div style={style}>
    {isInMobile ? <Row gutter={[8, 8]}>
          {children.map((child, index) => <Col span={ItemSpan} md={ItemSpan} xs={24} key={index}>
            {child}
          </Col>)}
        </Row> : children}
  </div>;
};
export default Responsive;