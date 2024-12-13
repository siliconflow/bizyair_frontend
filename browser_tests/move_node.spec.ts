import { expect, test } from "@playwright/test";

[
  "BizyAir_StyleModelApplySimple",
  "BizyAir_ReduxAdvanced",
  "BizyAir_InstantIDModelLoader",
  "BizyAir_ApplyInstantID",
  "BizyAir_ApplyInstantIDAdvanced",
  "BizyAir_InstantIDFaceAnalysis",
  "BizyAir_PulidFluxModelLoader",
  "BizyAir_PulidFluxInsightFaceLoader",
  "BizyAir_PulidFluxEvaClipLoader",
  "BizyAir_ApplyPulidFlux",
  "BizyAir_SetUnionControlNetType",
  "BizyAir_ControlNetInpaintingAliMamaApply",
  "BizyAir_DisableNoise",
  "BizyAir_FlipSigmas",
  "BizyAir_CFGGuider",
  "BizyAir_DifferentialDiffusion",
  "BizyAir_CLIPTextEncodeFlux",
  "BizyAir_FluxGuidance",
  "BizyAir_LoadImageURL",
  "BizyAir_Image_Encode",
  "BizyAir_InstructPixToPixConditioning",
  "BizyAir_IPAdapterUnifiedLoader",
  "BizyAir_IPAdapterModelLoader",
  "BizyAir_IPAdapterSimple",
  "BizyAir_IPAdapterAdvanced",
  "BizyAir_IPAdapterStyleComposition",
  "BizyAir_MZ_KolorsUNETLoaderV2",
  "BizyAir_MZ_KolorsControlNetLoader",
  "BizyAir_ModelSamplingSD3",
  "BizyAir_ModelSamplingFlux",
  "BizyAir_TripleCLIPLoader",
  "BizyAir_ControlNetApplySD3",
  "BizyAir_UltimateSDUpscale",
  "BizyAir_UpscaleModelLoader",
  "BizyAir_MinusZoneChatGLM3TextEncode",
  "BizyAir_KSampler",
  "BizyAir_KSamplerAdvanced",
  "BizyAir_CheckpointLoaderSimple",
  "BizyAir_CLIPTextEncode",
  "BizyAir_VAEDecode",
  "BizyAir_LoraLoader",
  "BizyAir_LoraLoader_Legacy",
  "BizyAir_VAEEncode",
  "BizyAir_VAEEncodeForInpaint",
  "BizyAir_ControlNetLoader",
  "BizyAir_ControlNetLoader_Legacy",
  "BizyAir_ControlNetApplyAdvanced",
  "BizyAir_ControlNetApply",
  "BizyAir_CLIPVisionLoader",
  "BizyAir_VAELoader",
  "BizyAir_UNETLoader",
  "BizyAir_SamplerCustomAdvanced",
  "BizyAir_BasicGuider",
  "BizyAir_BasicScheduler",
  "BizyAir_DualCLIPLoader",
  "BizyAir_KSamplerSelect",
  "BizyAir_RandomNoise",
  "BizyAir_CLIPSetLastLayer",
  "BizyAir_InpaintModelConditioning",
  "BizyAir_InpaintModelConditioning_v2",
  "BizyAir_SharedLoraLoader",
  "BizyAir_ConditioningCombine",
  "BizyAir_ConditioningAverage",
  "BizyAir_ConditioningConcat",
  "BizyAir_ConditioningSetArea",
  "BizyAir_ConditioningSetAreaPercentage",
  "BizyAir_ConditioningSetMask",
  "BizyAir_ConditioningZeroOut",
  "BizyAir_ConditioningSetTimestepRange",
  "BizyAir_SharedControlNetLoader",
  "BizyAir_CLIPVisionEncode",
  "BizyAir_StyleModelLoader",
  "BizyAir_StyleModelApply",
  "BizyAirRemoveBackground",
  "BizyAirGenerateLightningImage",
  "BizyAirToggleServerEndpoint",
  "BizyAirSiliconCloudLLMAPI",
  "BizyAirSiliconCloudVLMAPI",
  "BizyAirJoyCaption",
  "BizyAirJoyCaption2",
  "BizyAirPiDiNetPreprocessor",
  "BizyAirColorPreprocessor",
  "BizyAirCannyEdgePreprocessor",
  "BizyAirSAMPreprocessor",
  "BizyAirBinaryPreprocessor",
  "BizyAirScribblePreprocessor",
  "BizyAirM_LSDPreprocessor",
  "BizyAirUniFormer_SemSegPreprocessor",
  "BizyAirZoe_DepthMapPreprocessor",
  "BizyAirMiDaS_NormalMapPreprocessor",
  "BizyAirMiDaS_DepthMapPreprocessor",
  "BizyAirOpenposePreprocessor",
  "BizyAirLineArtPreprocessor",
  "BizyAirLeReS_DepthMapPreprocessor",
  "BizyAirBAE_NormalMapPreprocessor",
  "BizyAirOneFormer_COCO_SemSegPreprocessor",
  "BizyAirOneFormer_ADE20K_SemSegPreprocessor",
  "BizyAirHEDPreprocessor",
  "BizyAirFakeScribblePreprocessor",
  "BizyAirTilePreprocessor",
  "BizyAirDepthAnythingV2Preprocessor",
  "BizyAirMetric3D_DepthMapPreprocessor",
  "BizyAirMetric3D_NormalMapPreprocessor",
  "BizyAirDWPreprocessor",
  "StableDiffusionXLControlNetUnionPipeline",
  "BizyAirSegmentAnythingText",
  "BizyAirSegmentAnythingPointBox",
].forEach((nodeName) => {
  test(nodeName, async ({ page }) => {
    await page.goto("http://localhost:8188/");
    await page.locator(".workflows-tab-button").click();
    await page
      .locator(".comfyui-workflows-browse .node-label", {
        hasText: "EmptyWorkflow.json",
      })
      .click();
    await page.waitForTimeout(500);
    // Ref: https://github.com/Comfy-Org/ComfyUI_frontend/blob/57701f6145f622bf17237410c165966fb4aecc75/browser_tests/fixtures/components/ComfyNodeSearchBox.ts
    const input = page.locator(
      '.comfy-vue-node-search-container input[type="text"]',
    );
    const dropdown = page.locator(
      ".comfy-vue-node-search-container .p-autocomplete-list",
    );
    await expect(async() => {
      await page.locator("#graph-canvas").dblclick({
        position: {
          x: 600,
          y: 300,
        },
      });
      await input.waitFor({ state: "visible" , timeout: 1000});
      await input.fill(nodeName);
      await page.waitForTimeout(500);
      await dropdown.waitFor({ state: "visible" , timeout: 1000});
    }).toPass({timeout: test.info().timeout})

    // Wait for some time for the auto complete list to update.
    // The auto complete list is debounced and may take some time to update.
    await dropdown.locator("li").nth(0).click();
    await page.waitForTimeout(500);
    // NOTE: not elegant but for BizyAirToggleServerEndpoint it clicks on its dropdown so need some
    // offset while not breaking the others.
    let y = 350;
    if (nodeName === "BizyAirToggleServerEndpoint") {
      y = 370;
    }
    await page.mouse.move(700, y);
    await page.mouse.down();
    await page.mouse.move(1000, y);
    await page.mouse.up();
    await expect(page).toHaveScreenshot(`move_${nodeName}.png`, {
      maxDiffPixelRatio: 0.01,
      threshold: 0.1,
    });
  });
});