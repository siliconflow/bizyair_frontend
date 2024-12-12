import { expect, test } from "@playwright/test";

[
  //"☁️BizyAir Apply style model (simple)",
  //"☁️BizyAir Apply Redux model (advanced)",
  //"☁️BizyAir Load InstantID Model",
  //"☁️BizyAir Apply InstantID",
  //"☁️BizyAir Apply InstantID Adavanced",
  //"☁️BizyAir InstantID Face Analysis",
  //"☁️BizyAir Load PuLID Flux Model",
  //"☁️BizyAir Load InsightFace (PuLID Flux)",
  //"☁️BizyAir Load Eva Clip (PuLID Flux)",
  //"☁️BizyAir Apply PuLID Flux",
  //"☁️BizyAir SetUnionControlNetType",
  //"☁️BizyAir ControlNetInpaintingAliMamaApply",
  //"☁️BizyAir DisableNoise",
  //"☁️BizyAir FlipSigmas",
  //"☁️BizyAir CFGGuider",
  //"☁️BizyAir Differential Diffusion",
  //"☁️BizyAir CLIPTextEncodeFlux",
  //"☁️BizyAir FluxGuidance",
  //"☁️BizyAir Load Image (URL)",
  //"☁️BizyAir Image Encode",
  //"☁️BizyAir InstructPixToPixConditioning",
  //"☁️BizyAir IPAdapter Unified Loader",
  //"☁️BizyAir IPAdapterModelLoader",
  //"☁️BizyAir IPAdapter",
  //"☁️BizyAir IPAdapterAdvanced",
  //"☁️BizyAir IPAdapterStyleComposition",
  //"☁️BizyAir MinusZone - KolorsUNETLoaderV2",
  //"☁️BizyAir MinusZone - KolorsControlNetLoader",
  //"☁️BizyAir ModelSamplingSD3",
  //"☁️BizyAir ModelSamplingFlux",
  //"☁️BizyAir TripleCLIPLoader",
  //"☁️BizyAir Apply Controlnet with VAE",
  //"☁️BizyAir UltimateSDUpscale",
  //"☁️BizyAir Load Upscale Model",
  //"☁️BizyAir MinusZone ChatGLM3 Text Encode",
  //"☁️BizyAir KSampler",
  //"☁️BizyAir KSampler (Advanced)",
  //"☁️BizyAir Load Checkpoint",
  //"☁️BizyAir CLIP Text Encode (Prompt)",
  //"☁️BizyAir VAE Decode",
  //"☁️BizyAir Load LoRA",
  //"☁️BizyAir LoraLoader_Legacy",
  //"☁️BizyAir VAE Encode",
  //"☁️BizyAir VAE Encode (for Inpainting)",
  //"☁️BizyAir Load ControlNet Model",
  //"☁️BizyAir ControlNetLoader_Legacy",
  //"☁️BizyAir Apply ControlNet",
  //"☁️BizyAir Apply ControlNet (OLD)",
  //"☁️BizyAir Load CLIP Vision",
  //"☁️BizyAir Load VAE",
  //"☁️BizyAir Load Diffusion Model",
  //"☁️BizyAir SamplerCustomAdvanced",
  //"☁️BizyAir BasicGuider",
  //"☁️BizyAir BasicScheduler",
  //"☁️BizyAir DualCLIPLoader",
  //"☁️BizyAir KSamplerSelect",
  //"☁️BizyAir RandomNoise",
  //"☁️BizyAir CLIP Set Last Layer",
  //"☁️BizyAir InpaintModelConditioning",
  //"☁️BizyAir InpaintModelConditioning_v2",
  //"☁️BizyAir Shared Lora Loader",
  //"☁️BizyAir Conditioning (Combine)",
  //"☁️BizyAir Conditioning (Average)",
  //"☁️BizyAir Conditioning (Concat)",
  //"☁️BizyAir Conditioning (Set Area)",
  //"☁️BizyAir Conditioning (Set Area with Percentage)",
  //"☁️BizyAir Conditioning (Set Mask)",
  //"☁️BizyAir ConditioningZeroOut",
  //"☁️BizyAir ConditioningSetTimestepRange",
  //"☁️BizyAir Shared Load ControlNet Model",
  //"☁️BizyAir CLIP Vision Encode",
  //"☁️BizyAir Load Style Model",
  //"☁️BizyAir Apply Style Model",
  //"☁️BizyAir Remove Image Background",
  //"☁️BizyAir Generate Photorealistic Images",
  //"☁️BizyAir Switch Server Endpoint",
  //"☁️BizyAir SiliconCloud LLM API",
  //"☁️BizyAir SiliconCloud VLM API",
  //"☁️BizyAir Joy Caption",
  //"☁️BizyAir Joy Caption2",
  //"☁️BizyAir PiDiNet Soft-Edge Lines",
  //"☁️BizyAir Color Pallete",
  //"☁️BizyAir Canny Edge",
  //"☁️BizyAir SAM Segmentor",
  //"☁️BizyAir Binary Lines",
  //"☁️BizyAir Scribble Lines",
  //"☁️BizyAir M-LSD Lines",
  //"☁️BizyAir UniFormer Segmentor",
  //"☁️BizyAir Zoe Depth Map",
  //"☁️BizyAir MiDaS Normal Map",
  //"☁️BizyAir MiDaS Depth Map",
  //"☁️BizyAir OpenPose Pose",
  //"☁️BizyAir Realistic Lineart",
  //"☁️BizyAir LeReS Depth Map (enable boost for leres++)",
  //"☁️BizyAir BAE Normal Map",
  //"☁️BizyAir OneFormer COCO Segmentor",
  //"☁️BizyAir OneFormer ADE20K Segmentor",
  //"☁️BizyAir HED Soft-Edge Lines",
  //"☁️BizyAir Fake Scribble Lines (aka scribble_hed)",
  //"☁️BizyAir Tile",
  //"☁️BizyAir Depth Anything V2 - Relative",
  //"☁️BizyAir Metric3D Depth Map",
  //"☁️BizyAir Metric3D Normal Map",
  //"☁️BizyAir DWPose Estimator",
  //"☁️BizyAir Controlnet Union SDXL 1.0",
  //"☁️BizyAir Text Guided SAM",
  "☁️BizyAir Point-Box Guided SAM",
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
    await page.mouse.move(700, 350);
    await page.mouse.down();
    await page.mouse.move(1000, 350);
    await page.mouse.up();
    await expect(page).toHaveScreenshot(`move_${nodeName}.png`, {
      maxDiffPixelRatio: 0.01,
      threshold: 0.1,
    });
  });
});