import {useMemo, useState, type ComponentProps} from "react";
import {MessageProcessor} from "@a2ui/web_core/v0_9";
import {basicCatalog} from "@a2ui/web_core/v0_9/basic_catalog";
import {A2uiSurface} from "@a2ui/react/v0_9";
import {buildPilotMessages, pilotScenarios, type PilotScenario} from "./presets.js";
import {PILOT_SURFACE} from "./guard.js";

export function App() {
  const [scenario, setScenario] = useState<PilotScenario>("status");
  // A fresh processor per scenario avoids duplicate createSurface in StrictMode.
  // This proof-of-concept does not receive remote model messages or send actions.
  const result = useMemo(() => {
    try {
      const processor = new MessageProcessor([basicCatalog]);
      const payload = buildPilotMessages(scenario, basicCatalog.id);
      processor.processMessages(payload as Parameters<MessageProcessor["processMessages"]>[0]);
      const surface = processor.model.surfacesMap.get(PILOT_SURFACE);
      if (!surface) throw new Error("A2UI official SDK did not create the surface");
      return {surface, error: null};
    } catch (error) {
      return {surface: null, error: error instanceof Error ? error.message : String(error)};
    }
  }, [scenario]);
  return <main className="pilot-shell">
    <header className="pilot-header">
      <span className="pilot-eyebrow">EXPERIMENT / A2UI</span>
      <h1>A2UI 标准优先，不堆新组件</h1>
      <p>独立验证：标准消息由官方 MessageProcessor 处理，通过官方 A2uiSurface 渲染。下方数据均为演示。</p>
    </header>
    <nav aria-label="场景选择" className="pilot-switches">
      {pilotScenarios.map(item => <button type="button" key={item.id}
        aria-pressed={scenario === item.id}
        onClick={() => setScenario(item.id)}>{item.label}</button>)}
    </nav>
    <section className="pilot-preview" aria-label="A2UI 官方 React 渲染区">
      <div className="pilot-preview-label">OFFICIAL A2UI / REACT / V0_9</div>
      {result.error
        ? <pre role="alert" className="pilot-error">{result.error}</pre>
        : result.surface
          ? <A2uiSurface key={scenario} surface={result.surface as unknown as ComponentProps<typeof A2uiSurface>["surface"]}/>
          : <p>等待 A2UI Surface…</p>}
    </section>
    <p className="pilot-explainer">{pilotScenarios.find(s => s.id === scenario)?.description}</p>
    <footer>这是独立实验，不替换 XINGYU 现有 JSON v1、不使用生产数据、不执行模型提供的脚本或操作。</footer>
  </main>;
}
