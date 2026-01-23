/**
 * 데이터 탭 컴포넌트
 */

import { Button, Typography, Tag, Upload, Alert } from "antd";
import {
    ExportOutlined,
    ImportOutlined,
    CloudOutlined,
    DatabaseOutlined,
} from "@ant-design/icons";
import type { DataTabProps } from "../../model/types";

const { Text, Paragraph } = Typography;

/**
 * 데이터 탭 컴포넌트
 * 데이터 내보내기/가져오기 기능 제공
 */
export function DataTab({
    on_export,
    on_import,
    is_logged_in,
}: DataTabProps) {
    return (
        <div className="data-tab">
            {/* 저장 위치 표시 */}
            <div style={{ marginBottom: 24 }}>
                <Text strong>데이터 저장 위치</Text>
                <div style={{ marginTop: 8 }}>
                    {is_logged_in ? (
                        <Tag icon={<CloudOutlined />} color="blue">
                            Firebase Cloud
                        </Tag>
                    ) : (
                        <Tag icon={<DatabaseOutlined />} color="default">
                            LocalStorage (브라우저)
                        </Tag>
                    )}
                </div>
                {!is_logged_in && (
                    <Alert
                        type="warning"
                        message="브라우저 데이터 삭제 시 데이터가 손실될 수 있습니다. 주기적으로 백업하세요."
                        style={{ marginTop: 8 }}
                        showIcon
                    />
                )}
            </div>

            {/* 내보내기 */}
            <div style={{ marginBottom: 24 }}>
                <Text strong>데이터 내보내기</Text>
                <Paragraph type="secondary" style={{ marginTop: 4 }}>
                    모든 작업 기록과 설정을 JSON 파일로 저장합니다.
                </Paragraph>
                <Button
                    icon={<ExportOutlined />}
                    onClick={on_export}
                >
                    내보내기
                </Button>
            </div>

            {/* 가져오기 */}
            <div>
                <Text strong>데이터 가져오기</Text>
                <Paragraph type="secondary" style={{ marginTop: 4 }}>
                    JSON 파일에서 데이터를 가져옵니다.
                </Paragraph>
                <Alert
                    type="warning"
                    message="주의: 가져오기 시 현재 데이터가 덮어씌워집니다."
                    style={{ marginBottom: 8 }}
                    showIcon
                />
                <Upload
                    accept=".json"
                    showUploadList={false}
                    beforeUpload={(file) => {
                        on_import(file);
                        return false;
                    }}
                >
                    <Button icon={<ImportOutlined />}>
                        가져오기
                    </Button>
                </Upload>
            </div>

            <style>{`
                .data-tab {
                    padding: 16px 0;
                }
            `}</style>
        </div>
    );
}

export default DataTab;
