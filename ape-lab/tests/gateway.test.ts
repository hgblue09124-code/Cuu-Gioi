import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// @ts-expect-error JS file import without type definitions
import { APEGatewayUI } from '../../artifacts/cuu-gioi/js/ape-gateway.js';

describe('APE Gateway UI Integration', () => {
  test('APE Gateway compiles context and populates UI fields', async () => {
    // Create DOM mock environment
    const elements: Record<string, { value?: string; innerText?: string; style: { display: string } }> = {
      apeContextInput: {
        value:
          'Runtime Console của Cửu Giới cần sửa lỗi cuộn nội dung. Giữ nguyên các chức năng hiện có. Sau khi sửa phải kiểm tra lại Runtime Console.',
        style: { display: 'block' },
      },
      apeResultArea: { style: { display: 'none' } },
      apeErrorDisplay: { style: { display: 'none' }, innerText: '' },
      apeTaskDisplay: { innerText: '', style: { display: 'block' } },
      apeProtocolDisplay: { innerText: '', style: { display: 'block' } },
      apeOriginalTokens: { innerText: '', style: { display: 'block' } },
      apeProtocolTokens: { innerText: '', style: { display: 'block' } },
      apeSavedTokens: { innerText: '', style: { display: 'block' } },
      apeReduction: { innerText: '', style: { display: 'block' } },
      apeSemanticIntegrity: { innerText: '', style: { display: 'block' } },
      apeExecutionTime: { innerText: '', style: { display: 'block' } },
      apeMeasurementStatus: { innerText: '', style: { display: 'block' } },
      apeFullReport: { innerText: '', style: { display: 'block' } },
    };

    (globalThis as unknown as { document: unknown }).document = {
      getElementById: (id: string) => elements[id] || null,
    };

    await APEGatewayUI.compileContext();

    assert.equal(elements.apeResultArea.style.display, 'block');
    assert.equal(elements.apeErrorDisplay.style.display, 'none');
    assert.equal(elements.apeTaskDisplay.innerText, 'Task: PATCH');
    assert.ok(elements.apeProtocolDisplay.innerText?.includes('T:PATCH'));
    assert.equal(elements.apeOriginalTokens.innerText, '56');
    assert.equal(elements.apeProtocolTokens.innerText, '32');
    assert.equal(elements.apeSavedTokens.innerText, '24');
    assert.equal(elements.apeReduction.innerText, '42.86%');
    assert.equal(elements.apeSemanticIntegrity.innerText, '100%');
    assert.equal(elements.apeMeasurementStatus.innerText, 'ACTUAL');
    assert.ok(elements.apeFullReport.innerText?.includes('BÁO CÁO TỐI ƯU APE LAB'));
  });

  test('Cửu Giới index.html contains APE Lab UI panel and ape-gateway script tag', () => {
    const indexPath = path.resolve(import.meta.dirname, '../../artifacts/cuu-gioi/index.html');
    assert.ok(fs.existsSync(indexPath));
    const htmlContent = fs.readFileSync(indexPath, 'utf-8');

    assert.ok(htmlContent.includes('APE Lab — Protocol Gateway'));
    assert.ok(htmlContent.includes('apeContextInput'));
    assert.ok(htmlContent.includes('apeCompileBtn'));
    assert.ok(htmlContent.includes('APEGatewayUI.compileContext()'));
    assert.ok(htmlContent.includes('js/ape-gateway.js'));
  });
});
