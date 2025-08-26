<template>
  <Teleport to="body">
    <div class="sidebar-wrapper" v-if="sidebarStore.isOpen" :style="{ width: `${sidebarWidth}px` }">
      <div class="resize-handle" @mousedown="startResize"></div>
      <div class="sidebar-header">
        <h2>{{ $t('sidebar.assistant.title') }}</h2>
        <div class="header-actions">
          <button class="action-btn interactive-element" @click="clearHistory" title="清空对话历史">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              />
            </svg>
          </button>
          <button class="close-btn interactive-element" @click="sidebarStore.closeSidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
              />
            </svg>
          </button>
        </div>
      </div>
      <div class="chat-container">
        <div class="chat-messages" ref="chatMessagesRef">
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']"
          >
            <div class="message-avatar">
              <div class="avatar-icon">
                {{ message.role === 'user' ? '👤' : '🤖' }}
              </div>
            </div>
            <div class="message-content">
              <div class="message-header">
                <div class="sender-info">
                  <span class="message-sender">{{
                    message.role === 'user' ? 'You' : $t('sidebar.assistant.title')
                  }}</span>
                  <div
                    v-if="getMessageStatus(message)"
                    class="status-indicator"
                    :class="getMessageStatus(message)"
                  >
                    <!-- 正在生成 -->
                    <template v-if="getMessageStatus(message) === 'generating'">
                      <svg
                        class="status-icon typing"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 12H8.01M12 12H12.01M16 12H16.01"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <span class="status-text">正在生成</span>
                    </template>

                    <!-- 正在进行工具调用 -->
                    <template v-else-if="getMessageStatus(message) === 'tool-calling'">
                      <svg
                        class="status-icon spinning"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <span class="status-text">正在使用工具</span>
                    </template>

                    <!-- 工具调用完成 -->
                    <template v-else-if="getMessageStatus(message) === 'tool-completed'">
                      <svg
                        class="status-icon"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <span class="status-text">已使用工具</span>
                    </template>
                  </div>
                </div>
                <span class="message-time">{{ message.time }}</span>
              </div>

              <!-- 图片消息 -->
              <div v-if="message.hasImage" class="message-image">
                <div v-if="message.images && message.images.length > 1" class="image-grid">
                  <div v-for="(img, idx) in message.images" :key="idx" class="image-container">
                    <img :src="img" alt="用户上传图片" class="message-img" />
                    <div class="image-overlay">
                      <button
                        class="image-action-btn expand-btn"
                        @click="expandImage(img)"
                        title="查看大图"
                      >
                        <svg
                          t="1752053278648"
                          fill="white"
                          width="24"
                          height="24"
                          class="icon"
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="2363"
                        >
                          <path
                            d="M919.920093 725.414549q3.014188 26.122962 7.033105 58.776664t7.53547 66.814498 7.53547 67.819227 7.033105 60.786122q6.028376 47.222277-41.193901 44.208089-25.118232-2.009459-56.767205-5.526011t-64.805039-7.53547-65.809769-8.037834-59.781393-7.033105q-29.137149-3.014188-37.174984-16.578033t9.042564-30.644243q11.052022-10.047293 27.127691-27.630056t27.127691-28.634785q11.052022-12.056752 7.033105-22.104044t-16.075669-23.108774q-28.13242-27.127691-51.241194-49.231735t-51.241194-51.241194q-6.028376-6.028376-12.056752-13.061481t-9.042564-15.573304-1.004729-18.085127 13.061481-20.59695q6.028376-6.028376 10.047293-10.549658t8.037834-8.037834 8.540199-8.037834 11.554387-12.559116q20.094586-20.094586 37.174984-17.080398t37.174984 23.108774 41.193901 40.691536 47.222277 46.719912q19.089857 18.085127 32.653702 25.118232t26.625326-6.028376q9.042564-9.042564 22.606409-21.60168t23.611138-22.606409q17.080398-17.080398 30.644243-13.061481t16.578033 30.141879zM43.79615 383.80659q-3.014188-26.122962-7.033105-58.776664t-7.53547-66.814498-7.53547-67.819227-7.033105-60.786122q-3.014188-26.122962 6.53074-36.170255t33.658431-8.037834q25.118232 2.009459 56.767205 5.526011t64.805039 7.53547 65.809769 8.037834 59.781393 7.033105q30.141879 3.014188 37.677348 16.578033t-9.544928 30.644243q-10.047293 10.047293-24.615868 26.122962t-25.620597 27.127691q-12.056752 12.056752-8.037834 22.104044t17.080398 23.108774q13.061481 14.06621 24.615868 24.615868t22.606409 21.099315 23.108774 22.606409l25.118232 25.118232q6.028376 6.028376 11.554387 14.06621t8.037834 17.080398-0.502365 19.089857-13.061481 20.094586l-11.052022 11.052022q-4.018917 4.018917-7.53547 8.037834t-8.540199 8.037834l-11.052022 12.056752q-20.094586 20.094586-34.663161 15.070939t-34.663161-25.118232-38.179713-37.677348-44.208089-43.705724q-18.085127-18.085127-32.151337-25.118232t-27.127691 6.028376q-9.042564 10.047293-25.118232 24.615868t-26.122962 24.615868q-17.080398 17.080398-30.141879 13.061481t-16.075669-30.141879zM905.853883 84.397261q26.122962-3.014188 36.170255 6.53074t8.037834 34.663161-5.526011 56.767205-7.53547 64.805039-8.037834 65.809769-7.033105 59.781393q-3.014188 29.137149-16.578033 37.174984t-30.644243-10.047293q-10.047293-10.047293-26.122962-24.615868t-27.127691-25.620597q-12.056752-11.052022-22.104044-7.53547t-23.108774 16.578033q-27.127691 27.127691-47.724641 49.231735t-48.729371 50.236465q-6.028376 6.028376-14.06621 11.554387t-17.080398 8.037834-19.089857-0.502365-20.094586-14.06621q-6.028376-6.028376-10.549658-10.047293t-8.540199-8.037834-8.540199-8.037834-11.554387-12.056752q-20.094586-20.094586-16.075669-35.165525t25.118232-35.165525l38.179713-40.189172q19.089857-20.094586 45.212818-46.217547 19.089857-18.085127 26.122962-32.151337t-7.033105-26.122962q-9.042564-9.042564-23.108774-24.615868t-24.113503-25.620597q-17.080398-17.080398-13.061481-30.141879t30.141879-16.075669 58.776664-7.033105 67.316863-7.53547 67.819227-7.53547 60.283758-7.033105zM350.238584 640.012559q6.028376 6.028376 10.549658 10.047293t8.540199 8.037834l8.037834 9.042564 12.056752 11.052022q20.094586 20.094586 17.582763 36.672619t-23.611138 37.677348q-19.089857 19.089857-40.189172 40.691536t-47.222277 47.724641q-18.085127 18.085127-22.606409 29.639514t8.540199 24.615868q10.047293 9.042564 22.606409 22.606409t22.606409 23.611138q17.080398 17.080398 12.559116 30.141879t-30.644243 16.075669-58.274299 7.033105-66.814498 8.037834-68.321592 8.037834-60.786122 7.033105q-25.118232 2.009459-35.66789-7.53547t-8.540199-33.658431q2.009459-25.118232 5.526011-56.767205t7.53547-64.805039 8.037834-65.809769 7.033105-59.781393q3.014188-30.141879 16.578033-37.677348t30.644243 9.544928q10.047293 10.047293 27.630056 26.122962t28.634785 27.127691q12.056752 12.056752 20.094586 10.549658t20.094586-14.568575q13.061481-13.061481 25.118232-25.620597t24.113503-24.615868 24.615868-25.118232 26.625326-27.127691q6.028376-6.028376 13.061481-12.056752t15.573304-9.042564 18.085127-0.502365 20.59695 13.563845z"
                            p-id="2364"
                          ></path>
                        </svg>
                      </button>
                      <div class="top-right-actions">
                        <button
                          class="image-action-btn"
                          @click="selectExistingImage(img || '')"
                          title="添加到输入"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                          >
                            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                          </svg>
                        </button>
                        <button
                          class="image-action-btn"
                          @click="downloadImage(img || '')"
                          title="下载图片"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="image-container">
                  <img :src="message.image" alt="用户上传图片" class="message-img" />
                  <div class="image-overlay">
                    <button
                      class="image-action-btn expand-btn"
                      @click="expandImage(message.image)"
                      title="查看大图"
                    >
                      <svg
                        t="1752053278648"
                        fill="white"
                        width="24"
                        height="24"
                        class="icon"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        p-id="2363"
                      >
                        <path
                          d="M919.920093 725.414549q3.014188 26.122962 7.033105 58.776664t7.53547 66.814498 7.53547 67.819227 7.033105 60.786122q6.028376 47.222277-41.193901 44.208089-25.118232-2.009459-56.767205-5.526011t-64.805039-7.53547-65.809769-8.037834-59.781393-7.033105q-29.137149-3.014188-37.174984-16.578033t9.042564-30.644243q11.052022-10.047293 27.127691-27.630056t27.127691-28.634785q11.052022-12.056752 7.033105-22.104044t-16.075669-23.108774q-28.13242-27.127691-51.241194-49.231735t-51.241194-51.241194q-6.028376-6.028376-12.056752-13.061481t-9.042564-15.573304-1.004729-18.085127 13.061481-20.59695q6.028376-6.028376 10.047293-10.549658t8.037834-8.037834 8.540199-8.037834 11.554387-12.559116q20.094586-20.094586 37.174984-17.080398t37.174984 23.108774 41.193901 40.691536 47.222277 46.719912q19.089857 18.085127 32.653702 25.118232t26.625326-6.028376q9.042564-9.042564 22.606409-21.60168t23.611138-22.606409q17.080398-17.080398 30.644243-13.061481t16.578033 30.141879zM43.79615 383.80659q-3.014188-26.122962-7.033105-58.776664t-7.53547-66.814498-7.53547-67.819227-7.033105-60.786122q-3.014188-26.122962 6.53074-36.170255t33.658431-8.037834q25.118232 2.009459 56.767205 5.526011t64.805039 7.53547 65.809769 8.037834 59.781393 7.033105q30.141879 3.014188 37.677348 16.578033t-9.544928 30.644243q-10.047293 10.047293-24.615868 26.122962t-25.620597 27.127691q-12.056752 12.056752-8.037834 22.104044t17.080398 23.108774q13.061481 14.06621 24.615868 24.615868t22.606409 21.099315 23.108774 22.606409l25.118232 25.118232q6.028376 6.028376 11.554387 14.06621t8.037834 17.080398-0.502365 19.089857-13.061481 20.094586l-11.052022 11.052022q-4.018917 4.018917-7.53547 8.037834t-8.540199 8.037834l-11.052022 12.056752q-20.094586 20.094586-34.663161 15.070939t-34.663161-25.118232-38.179713-37.677348-44.208089-43.705724q-18.085127-18.085127-32.151337-25.118232t-27.127691 6.028376q-9.042564 10.047293-25.118232 24.615868t-26.122962 24.615868q-17.080398 17.080398-30.141879 13.061481t-16.075669-30.141879zM905.853883 84.397261q26.122962-3.014188 36.170255 6.53074t8.037834 34.663161-5.526011 56.767205-7.53547 64.805039-8.037834 65.809769-7.033105 59.781393q-3.014188 29.137149-16.578033 37.174984t-30.644243-10.047293q-10.047293-10.047293-26.122962-24.615868t-27.127691-25.620597q-12.056752-11.052022-22.104044-7.53547t-23.108774 16.578033q-27.127691 27.127691-47.724641 49.231735t-48.729371 50.236465q-6.028376 6.028376-14.06621 11.554387t-17.080398 8.037834-19.089857-0.502365-20.094586-14.06621q-6.028376-6.028376-10.549658-10.047293t-8.540199-8.037834-8.540199-8.037834-11.554387-12.056752q-20.094586-20.094586-16.075669-35.165525t25.118232-35.165525l38.179713-40.189172q19.089857-20.094586 45.212818-46.217547 19.089857-18.085127 26.122962-32.151337t-7.033105-26.122962q-9.042564-9.042564-23.108774-24.615868t-24.113503-25.620597q-17.080398-17.080398-13.061481-30.141879t30.141879-16.075669 58.776664-7.033105 67.316863-7.53547 67.819227-7.53547 60.283758-7.033105zM350.238584 640.012559q6.028376 6.028376 10.549658 10.047293t8.540199 8.037834l8.037834 9.042564 12.056752 11.052022q20.094586 20.094586 17.582763 36.672619t-23.611138 37.677348q-19.089857 19.089857-40.189172 40.691536t-47.222277 47.724641q-18.085127 18.085127-22.606409 29.639514t8.540199 24.615868q10.047293 9.042564 22.606409 22.606409t22.606409 23.611138q17.080398 17.080398 12.559116 30.141879t-30.644243 16.075669-58.274299 7.033105-66.814498 8.037834-68.321592 8.037834-60.786122 7.033105q-25.118232 2.009459-35.66789-7.53547t-8.540199-33.658431q2.009459-25.118232 5.526011-56.767205t7.53547-64.805039 8.037834-65.809769 7.033105-59.781393q3.014188-30.141879 16.578033-37.677348t30.644243 9.544928q10.047293 10.047293 27.630056 26.122962t28.634785 27.127691q12.056752 12.056752 20.094586 10.549658t20.094586-14.568575q13.061481-13.061481 25.118232-25.620597t24.113503-24.615868 24.615868-25.118232 26.625326-27.127691q6.028376-6.028376 13.061481-12.056752t15.573304-9.042564 18.085127-0.502365 20.59695 13.563845z"
                          p-id="2364"
                        ></path>
                      </svg>
                    </button>
                    <div class="top-right-actions">
                      <button
                        class="image-action-btn"
                        @click="selectExistingImage(message.image || '')"
                        title="添加到输入"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                        >
                          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                      </button>
                      <button
                        class="image-action-btn"
                        @click="downloadImage(message.image || '')"
                        title="下载图片"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                        >
                          <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <!-- <div
                  v-if="
                    message.role === 'assistant' &&
                    sidebarStore.nodeInfo &&
                    canApplyToNode(sidebarStore.nodeInfo) &&
                    !serverMode
                  "
                  class="image-actions"
                >
                  <button
                    class="apply-to-node-btn"
                    @click="applyImageToNode(message.image)"
                    :title="getNodeActionTitle(sidebarStore.nodeInfo)"
                  >
                    {{ getNodeActionText(sidebarStore.nodeInfo) }}
                  </button>
                </div> -->
              </div>

              <!-- 工具调用前的内容 -->
              <div
                v-if="message.preToolContent"
                class="message-text pre-tool-content"
                v-html="message.preToolContent"
              ></div>

              <!-- 没有工具调用时的完整内容 -->
              <div
                v-else-if="!message.toolName"
                class="message-text"
                v-html="message.content"
              ></div>

              <!-- 工具调用与结果 -->
              <div v-if="message.toolName" class="tool-section">
                <div class="tool-header">
                  <span class="tool-title">调用工具: {{ message.toolName }}</span>
                  <button
                    class="tool-args-toggle interactive-element"
                    @click="toggleToolArgs(message)"
                  >
                    {{ message.showToolArgs ? '隐藏参数' : '显示参数' }}
                  </button>
                </div>
                <div v-if="message.showToolArgs" class="tool-args">
                  <pre class="code-block"><code>{{ message.toolCallArgs }}</code></pre>
                </div>

                <div v-if="message.toolResultText && !message.hasImage" class="tool-result">
                  <div class="tool-result-label">工具结果:</div>
                  <pre class="code-block"><code>{{ message.toolResultText }}</code></pre>
                </div>
              </div>

              <!-- 工具调用后的内容 -->
              <div
                v-if="message.postToolContent"
                class="message-text post-tool-content"
                v-html="message.postToolContent"
              ></div>
            </div>
          </div>
          <div v-if="isLoading" class="loading-indicator">
            <div class="loading-text">{{ processingStatus }}</div>
            <div class="loading-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        </div>
        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div v-if="sidebarStore?.nodeInfo" class="node-info-card">
            <div class="node-info-header">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="node-info-title">当前节点</span>
            </div>
            <div class="node-info-main">
              <div class="node-info-content">
                <div class="info-item">
                  <span class="label">{{ $t('sidebar.assistant.nodeName') }}</span>
                  <span class="value">{{ sidebarStore.nodeInfo.title }}</span>
                </div>
                <div class="info-item">
                  <span class="label">{{ $t('sidebar.assistant.nodeType') }}</span>
                  <span class="value">{{ sidebarStore.nodeInfo.type }}</span>
                </div>
              </div>
              <div v-if="sidebarStore.nodeInfo.imageInfo?.url" class="node-image-preview">
                <img
                  :src="sidebarStore.nodeInfo.imageInfo.url"
                  alt="节点图片"
                  class="node-preview-img"
                  @click="expandImage(sidebarStore.nodeInfo.imageInfo.url)"
                />
              </div>
            </div>
          </div>
          <div class="image-preview-area" v-if="previewImage">
            <div class="preview-image-container">
              <img :src="previewImage" alt="图片预览" class="preview-image-small" />
              <button class="remove-image-btn" @click="removeImage">×</button>
            </div>
          </div>

          <div class="input-controls">
            <button
              class="upload-image-btn interactive-element"
              @click="triggerImageUpload"
              :disabled="isLoading"
              :title="$t('sidebar.assistant.uploadImage')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 5v14H5V5h14zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14L6 17h12l-3.86-5.14z"
                />
              </svg>
            </button>

            <div class="textarea-container interactive-element">
              <textarea
                class="interactive-element"
                v-model="userInput"
                :placeholder="$t('sidebar.assistant.inputPlaceholder')"
                @keydown.enter="handleKeyDown"
                ref="textareaRef"
                :disabled="isLoading"
              ></textarea>
            </div>

            <!-- 发送/停止按钮合并 -->
            <button
              class="send-stop-btn interactive-element"
              @click="isGenerating ? abortGeneration() : sendMessage()"
              :disabled="!isGenerating && !canSendMessage"
              :title="isGenerating ? '停止生成' : $t('sidebar.assistant.sendMessage')"
            >
              <svg
                v-if="!isGenerating"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path fill="currentColor" d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2l.01 7z" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path fill="currentColor" d="M6 6h12v12H6z" />
              </svg>
            </button>
          </div>

          <input
            type="file"
            ref="imageInputRef"
            style="display: none"
            accept="image/*"
            @change="handleImageUpload"
          />
        </div>
      </div>
    </div>

    <!-- 图片查看弹窗 -->
    <div class="image-modal" v-if="showImageModal" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <img :src="modalImageSrc" alt="大图查看" class="modal-image" />
        <button class="modal-close-btn" @click="closeImageModal">×</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { useSidebarStore } from '../../stores/sidebarStore'
  import { onMounted, watch, ref, computed, onBeforeUnmount, nextTick } from 'vue'
  import {
    sendStreamChatRequest,
    formatOutputTextLight,
    formatOutputText,
    convertToApiHistory
  } from './util'
  import { useI18n } from 'vue-i18n'
  import { useToaster } from '@/components/modules/toats/index'
  import { v4 as uuidv4 } from 'uuid'
  import { downloadImage } from '@/utils/tool'
  import { useServerModeStore } from '@/stores/isServerMode'
  import { imageToOss, base64ToFile } from '@/components/modules/vUpload/imageToOss'
  import './Sidebar.css'
  const { t } = useI18n()
  const sidebarStore = useSidebarStore()

  // 侧边栏宽度相关变量
  const sidebarWidth = ref(550) // 默认宽度
  const minWidth = 50 // 最小宽度
  const maxWidth = 1300 // 最大宽度
  const isResizing = ref(false)

  // 开始拖拽
  const startResize = (e: MouseEvent) => {
    isResizing.value = true
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
    // 防止选中文本
    e.preventDefault()
  }

  const handleResize = (e: MouseEvent) => {
    if (!isResizing.value) return

    // 计算宽度 (窗口宽度 - 鼠标位置)
    const newWidth = window.innerWidth - e.clientX

    // 限制宽度范围
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebarWidth.value = newWidth
      // 保存宽度到本地存储
      localStorage.setItem('bizyair-sidebar-width', newWidth.toString())
    }
  }

  // 停止拖拽
  const stopResize = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }

  // 组件卸载前清理事件监听器
  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  })
  ;('---------------------------------------')

  // 聊天相关状态
  const chatMessages = ref<
    Array<{
      role: 'user' | 'assistant'
      content: string
      time: string
      hasImage?: boolean
      image?: string
      images?: string[]
      id?: string
      rawText?: string
      toolName?: string
      toolId?: string
      toolCallArgs?: string
      showToolArgs?: boolean
      toolResultText?: string
      preToolContent?: string // 工具调用前的内容
      postToolContent?: string // 工具调用后的内容
    }>
  >([])
  const userInput = ref('')
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const processingStatus = ref('')
  const previewImage = ref('')
  const uploadedImageOssUrl = ref('')
  const chatMessagesRef = ref<HTMLElement | null>(null)
  const textareaRef = ref<HTMLTextAreaElement | null>(null)
  const imageInputRef = ref<HTMLInputElement | null>(null)
  // 添加请求中止控制器
  const abortController = ref<AbortController | null>(null)

  // 计算属性：是否可以发送消息
  const canSendMessage = computed(() => userInput.value.trim() !== '' || previewImage.value !== '')

  // 获取当前时间格式化字符串
  const getCurrentTime = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // 触发图片上传
  const triggerImageUpload = () => imageInputRef.value?.click()

  // 处理图片上传
  const handleImageUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    if (!target.files?.length) return

    const file = target.files[0]

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      useToaster({
        type: 'error',
        message: t('sidebar.assistant.imageUploadError')
      })
      return
    }

    // 上传到 OSS
    try {
      const { url } = await imageToOss(file)
      uploadedImageOssUrl.value = url
      previewImage.value = url // 直接使用OSS URL作为预览
      console.log('图片已上传到 OSS:', url)
    } catch (error) {
      console.error('上传图片到 OSS 失败:', error)
      useToaster({
        type: 'error',
        message: '图片上传失败'
      })
    }
  }

  // 移除已选图片
  const removeImage = () => {
    previewImage.value = ''
    uploadedImageOssUrl.value = ''
    if (imageInputRef.value) {
      imageInputRef.value.value = ''
    }
  }

  const promptId = ref('')
  const requestId = ref('')

  // 生成新的会话ID
  const generateNewPromptId = () => {
    promptId.value = uuidv4()
    localStorage.setItem('bizyair-prompt-id', promptId.value)
  }

  // 生成新的请求ID
  const generateNewRequestId = () => {
    requestId.value = uuidv4()
  }

  // 清空对话历史
  const clearHistory = async () => {
    if (isGenerating.value) {
      abortGeneration()
    }

    // 创建一个新的欢迎消息
    const welcomeMessage = {
      role: 'assistant' as const,
      content: t('sidebar.assistant.welcomeMessage'),
      time: getCurrentTime()
    }

    setTimeout(() => {
      chatMessages.value = [welcomeMessage]
      generateNewPromptId()
    }, 10)
  }

  // 中止生成
  const abortGeneration = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
      isLoading.value = false
      isGenerating.value = false
      processingStatus.value = ''
    }
  }

  // 切换工具参数显示
  const toggleToolArgs = (message: any) => {
    message.showToolArgs = !message.showToolArgs
  }

  // 获取消息状态
  const getMessageStatus = (message: any) => {
    if (message.role !== 'assistant') return null

    // 如果是当前正在生成的消息
    const isCurrentMessage = isGenerating.value && message.rawText !== undefined

    if (isCurrentMessage) {
      // 如果有工具调用但还没有工具调用后的内容
      if (message.toolName && !message.postToolContent) {
        return 'tool-calling' // 正在进行工具调用
      }
      // 如果没有工具调用，或者工具调用已完成但还在生成后续内容
      return 'generating' // 正在生成
    }

    // 对于已完成的消息，如果有工具调用则显示完成状态
    if (message.toolName && message.postToolContent) {
      return 'tool-completed' // 工具调用完成
    }

    return null
  }

  // 服务端模式
  const serverMode = ref(false)

  const sendMessage = async () => {
    if (!canSendMessage.value || isLoading.value) return
    generateNewRequestId()

    const messageText = userInput.value
    const currentTime = getCurrentTime()
    const hasImage = !!previewImage.value

    nextTick(() => {
      isLoading.value = true
      isGenerating.value = true
    })

    // 创建用户消息并添加到聊天记录
    const userMessage = {
      role: 'user' as const,
      content: messageText || (hasImage ? '请分析这张图片' : ''),
      time: currentTime,
      hasImage: hasImage,
      image: previewImage.value
    }

    chatMessages.value.push(userMessage)

    // 清空输入并滚动到底部
    userInput.value = ''
    setTimeout(() => {
      scrollToBottom()
    }, 0)

    try {
      // 创建AbortController用于中止请求
      abortController.value = new AbortController()

      // 记录当前消息时间，用于标识当前回答
      const currentMsgTime = getCurrentTime()
      let isFirstToken = true

      // 构建对话历史 - 转换前端消息格式为API格式
      const conversationHistory = convertToApiHistory(chatMessages.value.slice(0, -1)) // 排除刚添加的用户消息

      // 构建当前消息
      let currentMessage: string | null = null
      if (hasImage && previewImage.value) {
        // 如果有图片，将图片URL作为文本内容的一部分
        const imageUrl = uploadedImageOssUrl.value || previewImage.value
        const textContent = messageText || '请分析这张图片'
        currentMessage = `${textContent}\n\n图片地址：${imageUrl}`
      } else {
        // 纯文本消息
        currentMessage = messageText
      }

      // 使用统一的流式聊天请求
      abortController.value = await sendStreamChatRequest(
        currentMessage,
        conversationHistory,
        {
          onStart: () => {
            console.log('开始请求聊天模型...')
            isLoading.value = true
            // 立即滚动到底部
            setTimeout(() => {
              scrollToBottom()
              removeImage()
            }, 0)
          },
          onToken: (token: string) => {
            // 首次接收到token时创建新的助手消息
            if (isFirstToken) {
              chatMessages.value.push({
                role: 'assistant',
                content: formatOutputTextLight(token),
                rawText: token,
                time: currentMsgTime
              })
              isFirstToken = false
              isLoading.value = false
            } else {
              // 找到刚创建的消息并更新
              const currentAssistantMsg = chatMessages.value
                .filter(msg => msg.role === 'assistant' && msg.time === currentMsgTime)
                .pop()

              if (currentAssistantMsg) {
                currentAssistantMsg.rawText = (currentAssistantMsg.rawText || '') + token

                // 如果有工具调用，将新内容作为工具调用后的内容
                if (currentAssistantMsg.toolName) {
                  // 工具调用后的内容，需要单独保存
                  const postToolRawText = currentAssistantMsg.rawText || ''
                  currentAssistantMsg.postToolContent = formatOutputText(postToolRawText)

                  // 显示完整内容：工具调用前 + 工具调用后
                  const preContent = currentAssistantMsg.preToolContent || ''
                  const postContent = currentAssistantMsg.postToolContent || ''
                  currentAssistantMsg.content = preContent + postContent
                } else {
                  // 没有工具调用时，正常更新content
                  currentAssistantMsg.content = formatOutputTextLight(currentAssistantMsg.rawText)
                }
              }
            }

            // 滚动到底部
            setTimeout(() => {
              scrollToBottom()
            }, 0)
          },
          onToolCall: tool => {
            // 合并到当前助手消息；若不存在则创建
            let currentAssistantMsg = chatMessages.value
              .filter(msg => msg.role === 'assistant' && msg.time === currentMsgTime)
              .pop()
            if (!currentAssistantMsg) {
              currentAssistantMsg = {
                role: 'assistant',
                content: '',
                time: currentMsgTime
              }
              chatMessages.value.push(currentAssistantMsg)
            }

            // 保存工具调用前的内容
            if (currentAssistantMsg.rawText) {
              currentAssistantMsg.preToolContent = formatOutputText(currentAssistantMsg.rawText)
            }

            currentAssistantMsg.toolName = tool.name
            currentAssistantMsg.toolId = tool.id
            currentAssistantMsg.toolCallArgs = tool.arguments
            currentAssistantMsg.showToolArgs = false

            // 清空rawText，准备接收工具调用后的内容
            currentAssistantMsg.rawText = ''

            setTimeout(() => {
              scrollToBottom()
            }, 0)
          },
          onToolResult: payload => {
            let resultContent = ''
            try {
              resultContent =
                typeof payload.result === 'string' ? payload.result : JSON.stringify(payload.result)
            } catch (e) {
              resultContent = String(payload.result)
            }

            const isImageUrl =
              /^https?:\/\/\S+\.(png|jpg|jpeg|webp|gif)(\?\S*)?$/i.test(resultContent) ||
              /^https?:\/\//i.test(resultContent)

            const currentAssistantMsg = chatMessages.value
              .filter(msg => msg.role === 'assistant' && msg.time === currentMsgTime)
              .pop()

            if (currentAssistantMsg) {
              // 保存工具结果文本，用于对话历史记录
              currentAssistantMsg.toolResultText = resultContent

              if (isImageUrl) {
                const urls = resultContent
                  .split(/\s+/)
                  .map(u => u.trim())
                  .filter(u => /^https?:\/\//i.test(u))

                if (urls.length > 1) {
                  currentAssistantMsg.hasImage = true
                  currentAssistantMsg.images = urls
                } else if (urls.length === 1) {
                  currentAssistantMsg.hasImage = true
                  currentAssistantMsg.image = urls[0]
                  currentAssistantMsg.images = [urls[0]]
                }
              }
            }
            setTimeout(() => {
              scrollToBottom()
            }, 0)
          },
          onComplete: (fullText: string) => {
            console.log('聊天模型响应完成')

            // 更新状态
            isLoading.value = false
            isGenerating.value = false
            processingStatus.value = ''

            // 确保UI显示完整的回复
            const currentAssistantMsg = chatMessages.value
              .filter(msg => msg.role === 'assistant' && msg.time === currentMsgTime)
              .pop()

            if (currentAssistantMsg) {
              // 如果有工具调用，确保工具调用后的内容正确显示
              if (currentAssistantMsg.toolName) {
                // 工具调用后的内容已经在onToken中更新了
                if (currentAssistantMsg.postToolContent) {
                  currentAssistantMsg.content = currentAssistantMsg.postToolContent
                } else {
                  // 如果没有工具调用后的内容，只显示工具调用前的内容
                  currentAssistantMsg.content = currentAssistantMsg.preToolContent || ''
                }
              } else {
                // 没有工具调用时，正常更新content
                currentAssistantMsg.content = formatOutputText(fullText)
              }
              currentAssistantMsg.rawText = undefined
            }

            // 滚动到底部
            setTimeout(() => {
              scrollToBottom()
            }, 0)
          },
          onError: error => {
            console.error('聊天请求失败:', error)
            const errorMsgTime = getCurrentTime()
            let errorMessage = ''
            if (error) {
              errorMessage = error.message
            }
            // 添加错误消息
            chatMessages.value.push({
              role: 'assistant',
              content: `发生错误: ${errorMessage}<br><br><span style="color: #ff4d4f;">建议检查Bizyair是否更新到最新版本，并检查网络状态或者代理</span>`,
              time: errorMsgTime
            })

            // 更新状态
            isLoading.value = false
            isGenerating.value = false
            processingStatus.value = ''
          }
        },
        {
          model_config: {
            temperature: 0.5,
            max_tokens: 128000
          }
        }
      )
    } catch (error) {
      const errorMsgTime = getCurrentTime()

      // 添加错误消息
      chatMessages.value.push({
        role: 'assistant',
        content: String(error),
        time: errorMsgTime
      })

      // 更新状态
      isLoading.value = false
      isGenerating.value = false
      processingStatus.value = ''
    } finally {
      console.log('请求处理完成，重置状态')
      processingStatus.value = ''
      if (!abortController.value) {
        abortController.value = null
      }
      // 滚动到底部
      setTimeout(() => {
        scrollToBottom()
      }, 0)
    }
  }

  // 滚动到聊天底部
  const scrollToBottom = () => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  }

  // 处理节点信息更新
  watch(
    () => sidebarStore.nodeInfo,
    async newValue => {
      console.log('节点信息更新:', newValue)
      if (newValue?.imageInfo?.url || newValue?.imageInfo?.base64) {
        let ossUrl = ''

        try {
          if (newValue.imageInfo.filename && newValue.imageInfo.filename.startsWith('https://')) {
            // 已经是 OSS URL，直接使用
            ossUrl = newValue.imageInfo.filename
          } else if (newValue.imageInfo.url && newValue.imageInfo.url.startsWith('https://')) {
            // 已经是 OSS URL，直接使用
            ossUrl = newValue.imageInfo.url
          } else if (newValue.imageInfo.base64) {
            // 如果有 base64，需要上传到 OSS
            const base64Data = newValue.imageInfo.base64.startsWith('data:')
              ? newValue.imageInfo.base64
              : `data:image/webp;base64,${newValue.imageInfo.base64}`

            const file = base64ToFile(base64Data, 'image.webp', 'image/webp')
            const { url } = await imageToOss(file)
            ossUrl = url
          } else if (newValue.imageInfo.url) {
            // 从本地 URL 获取文件并上传到 OSS
            const response = await fetch(newValue.imageInfo.url)
            const blob = await response.blob()
            const file = new File([blob], 'image.webp', { type: 'image/webp' })
            const { url } = await imageToOss(file)
            ossUrl = url
          }
        } catch (error) {
          console.error('处理图片失败:', error)
          useToaster({
            type: 'error',
            message: '图片处理失败'
          })
          return
        }

        // 设置预览图片和 OSS URL（统一使用 OSS URL）
        previewImage.value = ossUrl
        uploadedImageOssUrl.value = ossUrl

        // 聚焦到输入框
        setTimeout(() => {
          textareaRef.value?.focus()
        }, 0)
      }
    },
    { deep: true }
  )

  // 修改canApplyToNode函数来返回更具体的操作类型
  // const canApplyToNode = (nodeInfo: any) => {
  //   // 根据节点类型返回不同的操作类型
  //   if (!nodeInfo || !nodeInfo.type) return false

  //   const nodeType = nodeInfo.type
  //   if (nodeType === 'LoadImage') {
  //     return 'apply' // 应用到节点
  //   } else if (nodeType === 'SaveImage') {
  //     return 'save-output' // 保存到output目录
  //   } else if (nodeType === 'PreviewImage') {
  //     return 'save-temp' // 保存到temp目录
  //   }
  //   return false // 其他类型节点不支持操作
  // }

  // // 添加getNodeActionText函数，返回按钮文本
  // const getNodeActionText = (nodeInfo: any) => {
  //   const actionType = canApplyToNode(nodeInfo)
  //   if (actionType === 'apply') {
  //     return '应用到当前节点'
  //   } else if (actionType === 'save-output') {
  //     return '保存到output目录'
  //   } else if (actionType === 'save-temp') {
  //     return '保存到temp目录'
  //   }
  //   return '应用到节点'
  // }

  // // 添加getNodeActionTitle函数，返回提示文本
  // const getNodeActionTitle = (nodeInfo: any) => {
  //   const actionType = canApplyToNode(nodeInfo)
  //   if (actionType === 'apply') {
  //     return '将图片应用到LoadImage节点'
  //   } else if (actionType === 'save-output') {
  //     return '将图片保存到output目录'
  //   } else if (actionType === 'save-temp') {
  //     return '将图片保存到temp目录'
  //   }
  //   return ''
  // }

  // 应用图片到当前节点
  // const applyImageToNode = async (imageUrl: string | undefined) => {
  //   if (!sidebarStore.nodeInfo) {
  //     console.error('没有选中的节点信息')
  //     return
  //   }

  //   if (!imageUrl) {
  //     console.error('没有图片URL')
  //     return
  //   }

  //   // 创建要发送到节点的图片数据对象（直接使用OSS URL）
  //   const imageData = {
  //     nodeId: sidebarStore.nodeInfo.id,
  //     imageUrl: imageUrl, // 直接使用OSS URL
  //     nodeType: sidebarStore.nodeInfo.type
  //   }
  //   console.log(window.bizyAirLib, 'window.bizyAirLib-----')

  //   // 如果window.bizyAirLib存在并有updateNodeImage方法，调用它
  //   if (
  //     typeof window.bizyAirLib !== 'undefined' &&
  //     typeof window.bizyAirLib.updateNodeImage === 'function'
  //   ) {
  //     window.bizyAirLib.updateNodeImage(imageData)
  //     useToaster({
  //       type: 'success',
  //       message: '图片已应用到节点: ' + sidebarStore.nodeInfo.title
  //     })
  //   } else {
  //     console.error('bizyAirLib.updateNodeImage未定义')
  //     useToaster({
  //       type: 'error',
  //       message: '应用图片到节点失败'
  //     })
  //   }
  // }

  // enter发送，shift+enter换行
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.shiftKey) {
      return
    }
    // enter键，发送消息
    e.preventDefault()
    sendMessage()
  }

  // 选择现有图片
  const selectExistingImage = async (imageUrl: string) => {
    if (!imageUrl) return

    try {
      if (imageUrl.startsWith('data:')) {
        // 如果是base64格式，需要上传到OSS
        const file = base64ToFile(imageUrl, 'image.webp', 'image/webp')
        const { url } = await imageToOss(file)
        previewImage.value = url
        uploadedImageOssUrl.value = url
        console.log('Base64图片已上传到 OSS:', url)
      } else if (
        imageUrl.startsWith('https') ||
        imageUrl.includes('oss-') ||
        imageUrl.includes('aliyuncs.com')
      ) {
        // 已经是 OSS URL，直接使用
        previewImage.value = imageUrl
        uploadedImageOssUrl.value = imageUrl
        console.log('使用现有 OSS URL:', imageUrl)
      } else {
        // 其他情况，直接使用原URL
        previewImage.value = imageUrl
        uploadedImageOssUrl.value = imageUrl
      }
    } catch (error) {
      console.error('处理图片失败:', error)
      useToaster({
        type: 'error',
        message: '图片处理失败'
      })
    }

    // 聚焦到输入框
    setTimeout(() => {
      textareaRef.value?.focus()
    }, 0)
  }

  // 图片弹窗相关状态
  const showImageModal = ref(false)
  const modalImageSrc = ref('')

  // 放大查看图片
  const expandImage = (imageSrc: string | undefined) => {
    if (!imageSrc) return
    modalImageSrc.value = imageSrc
    showImageModal.value = true
  }

  // 关闭图片弹窗
  const closeImageModal = () => {
    showImageModal.value = false
  }

  onMounted(() => {
    // 从本地存储加载宽度设置
    const savedWidth = localStorage.getItem('bizyair-sidebar-width')
    if (savedWidth) {
      const width = parseInt(savedWidth)
      if (width >= minWidth && width <= maxWidth) {
        sidebarWidth.value = width
      }
    }

    const savedPromptId = localStorage.getItem('bizyair-prompt-id')
    if (savedPromptId) {
      promptId.value = savedPromptId
    } else {
      generateNewPromptId()
    }

    generateNewRequestId()

    // 确保全局bizyAirLib对象存在
    if (typeof window.bizyAirLib === 'undefined') {
      ;(window as any).bizyAirLib = {}
    }

    // 直接定义updateNodeImage方法
    if (typeof (window as any).bizyAirLib.updateNodeImage !== 'function') {
      ;(window as any).bizyAirLib.updateNodeImage = function (imageData: any) {
        if (!imageData || !imageData.nodeId || !imageData.imageUrl) {
          console.error('应用图片到节点失败: 缺少必要的参数')
          return
        }

        try {
          console.log('正在尝试应用图片到节点...')

          // 直接使用传入的imageData.nodeId通过IFRAME找到节点
          // bizyAirLib直接传递postMessage到父窗口
          window.parent.postMessage(
            {
              type: 'APPLY_IMAGE_TO_NODE',
              data: {
                nodeId: imageData.nodeId,
                imageUrl: imageData.imageUrl // 使用OSS URL而不是base64
              }
            },
            '*'
          )

          console.log('已发送图片应用消息到ComfyUI')
        } catch (error) {
          console.error('应用图片到节点时发生异常:', error)
        }
      }
      console.log('已添加updateNodeImage方法到bizyAirLib对象')
    }

    // 显示欢迎消息
    const welcomeMessage = {
      role: 'assistant' as const,
      content: t('sidebar.assistant.welcomeMessage'),
      time: getCurrentTime()
    }
    chatMessages.value = [welcomeMessage]

    // 异步获取 server_mode
    ;(async () => {
      try {
        const serverModeStore = useServerModeStore()
        const isServerMode = await serverModeStore.setIsServerMode()
        serverMode.value = isServerMode
      } catch (e) {
        serverMode.value = false
      }
    })()
  })
</script>
