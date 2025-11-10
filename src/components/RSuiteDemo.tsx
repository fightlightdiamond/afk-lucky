"use client";

import {
  Button,
  ButtonToolbar,
  Panel,
  Input,
  InputGroup,
  Message,
} from "rsuite";
import SearchIcon from "@rsuite/icons/Search";

export default function RSuiteDemo() {
  return (
    <div style={{ padding: "20px" }}>
      <Panel header="RSuite Demo" bordered>
        <Message type="info" showIcon>
          RSuite đã được tích hợp thành công vào dự án Next.js của bạn!
        </Message>

        <div style={{ marginTop: "20px" }}>
          <h4>Buttons</h4>
          <ButtonToolbar>
            <Button appearance="primary">Primary</Button>
            <Button appearance="default">Default</Button>
            <Button appearance="subtle">Subtle</Button>
            <Button appearance="ghost">Ghost</Button>
            <Button appearance="link">Link</Button>
          </ButtonToolbar>
        </div>

        <div style={{ marginTop: "20px" }}>
          <h4>Input với Icon</h4>
          <InputGroup inside>
            <Input placeholder="Tìm kiếm..." />
            <InputGroup.Addon>
              <SearchIcon />
            </InputGroup.Addon>
          </InputGroup>
        </div>
      </Panel>
    </div>
  );
}
