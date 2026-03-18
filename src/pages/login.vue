<template>
  <div class="reds-modal login-modal" role="presentation">
    <i tabindex="-1" class="reds-mask" aria-label="弹窗遮罩"></i
    ><!---->
    <div class="login-container">
      <div class="icon-btn-wrapper close-button" @click="close"><Close style="width: 1em; height: 1em" /></div>
      <div class="left">
        <img class="logo" src="@/assets/logo.png" />
        <div class="qrcode">
          <img
            class="qrcode-img"
            src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=PetVerse%20Login"
          />
          <div class="status" style="display: none"><!----><!----></div>
        </div>
        <div class="tip">扫码登录 PetVerse</div>
      </div>
      <div class="right">
        <div class="title">{{ isLoginMode ? '登录' : '注册' }}</div>
        <div class="input-container">
          <form @submit.prevent="handleSubmit">
            <template v-if="!isLoginMode">
              <label class="input-field"
                ><input v-model="formData.username" placeholder="输入用户名" type="text" name="username" :autofocus="true" />
              </label>
              <div style="height: 16px"></div>
              <label class="input-field"
                ><input v-model="formData.nickname" placeholder="输入昵称" type="text" name="nickname" />
              </label>
              <div style="height: 16px"></div>
              <label class="input-field"
                ><input v-model="formData.phone" placeholder="输入手机号" type="text" name="phone" />
              </label>
              <div style="height: 16px"></div>
              <label class="input-field"
                ><input v-model="formData.email" placeholder="输入邮箱" type="email" name="email" />
              </label>
              <div style="height: 16px"></div>
            </template>
            <template v-else>
              <label class="input-field"
                ><input v-model="formData.usernameOrEmail" placeholder="输入用户名或邮箱" type="text" name="usernameOrEmail" :autofocus="true" />
              </label>
              <div style="height: 16px"></div>
            </template>
            <label class="input-field"
              ><input v-model="formData.password" placeholder="输入密码" type="password" name="password" />
            </label>
            <div class="err-msg" v-if="errorMsg">{{ errorMsg }}</div>
            <button class="submit" :disabled="isLoading">{{ isLoading ? '处理中...' : (isLoginMode ? '登录' : '注册') }}</button>
          </form>
        </div>
        <div class="agreements">
          <input type="checkbox" id="agree" v-model="isAgree" class="agree-checkbox" />
          <label for="agree" class="agree-label">
            <span class="agree-icon"></span>
            <span>我已阅读并同意</span>
          </label>
          <a class="links" target="_blank" href="#">《用户协议》</a>
          <a class="links" target="_blank" href="#">《隐私政策》</a>
        </div>
        <div class="oauth-tip"><span class="oauth-tip-line">或</span></div>
        <div class="login">
          <div class="login-common wechat">
            <svg class="reds-icon" width="18" height="18" style="margin-right: 4px">
              <use xlink:href="#wechat"></use></svg
            >微信登录
          </div>
          <div class="login-common reg" @click="toggleMode">{{ isLoginMode ? '新用户注册' : '已有账号？登录' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { Close } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/userStore";
import { ElMessage } from "element-plus";

const emit = defineEmits(["clickChild"]);
const userStore = useUserStore();

const isLoginMode = ref(true);
const isLoading = ref(false);
const errorMsg = ref("");
const isAgree = ref(false);

const formData = reactive({
  usernameOrEmail: "",
  password: "",
  username: "",
  nickname: "",
  phone: "",
  email: ""
});

const close = () => {
  emit("clickChild", false);
};

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  errorMsg.value = "";
  resetForm();
};



const resetForm = () => {
  if (isLoginMode.value) {
    formData.usernameOrEmail = "";
    formData.password = "";
  } else {
    formData.username = "";
    formData.nickname = "";
    formData.phone = "";
    formData.email = "";
    formData.password = "";
  }
};

const handleSubmit = async () => {
  errorMsg.value = "";
  
  if (!isAgree.value) {
    errorMsg.value = "请阅读并同意用户协议和隐私政策";
    return;
  }
  
  isLoading.value = true;
  
  try {
    if (isLoginMode.value) {
      await userStore.loginAction({
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password
      });
      ElMessage.success("登录成功");
      close();
    } else {
      await userStore.registerAction({
        username: formData.username,
        nickname: formData.nickname,
        phone: formData.phone,
        email: formData.email,
        password: formData.password
      });
      ElMessage.success("注册成功，请登录");
      isLoginMode.value = true;
      resetForm();
    }
  } catch (error: any) {
    errorMsg.value = error.message || "操作失败";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="less" scoped>
a {
  text-decoration: none;
  background-color: transparent;
}
.login-modal {
  z-index: 100010;
  flex-direction: column;
}

.reds-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000002;
  box-sizing: border-box;
  visibility: visible;
  opacity: 1;
  transition:
    opacity 0.2s,
    visibility 0.2s;

  .reds-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.25);
    z-index: -1;
  }

  .login-container {
    display: flex;
    position: relative;
    width: 800px;
    height: 480px;
    background: #fff;
    border-radius: 16px;
    box-shadow:
      0 4px 32px 0 rgba(0, 0, 0, 0.08),
      0 1px 4px 0 rgba(0, 0, 0, 0.04);
    transition: all 0.2s;

    .close-button {
      position: absolute;
      right: 20px;
      top: 20px;
      cursor: pointer;
      color: rgba(51, 51, 51, 0.8);
    }

    .left {
      width: 400px;
      display: flex;
      align-items: center;
      flex-direction: column;
      border-right: 1px solid rgba(0, 0, 0, 0.08);

      img {
        border-style: none;
      }
      .logo {
        margin-top: 64px;
        width: 91.08px;
        height: 48px;
        -webkit-user-select: none;
        user-select: none;
        pointer-events: none;
      }

      .qrcode {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 32px;
        width: 192px;
        height: 192px;
        border: 2px solid var(--color-shadow-border);
        border-radius: 12px;
        background: var(--color-white);

        .qrcode-img {
          width: 160px;
          height: 160px;
        }

        .status {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          flex-direction: column;
          background: #fff;
          opacity: 0.95;
          -webkit-backdrop-filter: blur(2.5px);
          backdrop-filter: blur(2.5px);
          border-radius: 10px;
        }
      }

      .tip {
        color: #333;
        font-weight: 600;
        font-size: 12px;
        margin-top: 16px;
        line-height: 120%;
      }
    }

    .right {
      width: 400px;
      display: flex;
      align-items: center;
      flex-direction: column;
      margin-top: 48px;

      .title {
        font-size: 18px;
        color: rgba(51, 51, 51, 0.8);
        font-weight: 600;
        line-height: 120%;
      }

      .input-container {
        margin-top: 24px;
        width: 304px;
        display: flex;
        flex-direction: column;



        form {
          display: block;
          margin-top: 0em;
        }
      }

      .agreements {
          width: 100%;
          display: flex;
          align-items: center;
          margin-top: 16px;
          font-size: 12px;
          color: var(--color-textSecondary);
          line-height: 120%;

          .agree-checkbox {
            display: none;
          }

          .agree-label {
            display: flex;
            align-items: center;
            cursor: pointer;
            margin-right: 8px;

            .agree-icon {
              display: inline-block;
              width: 16px;
              height: 16px;
              border: 1px solid var(--color-border);
              border-radius: 4px;
              margin-right: 8px;
              position: relative;
              transition: all 0.3s;

              &::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 6px;
                width: 4px;
                height: 8px;
                border: solid var(--color-primary);
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
                opacity: 0;
                transition: opacity 0.3s;
              }
            }
          }

          .agree-checkbox:checked + .agree-label .agree-icon {
            background-color: var(--color-primary);
            border-color: var(--color-primary);

            &::after {
              opacity: 1;
            }
          }

          a {
            color: var(--color-primary);
            margin: 0 4px;
            text-decoration: none;
            transition: color 0.3s;

            &:hover {
              text-decoration: underline;
            }
          }

          .links {
            font-weight: 400;
          }
        }

        .input-field {
          display: flex;
          align-items: center;
          font-size: 16px;
          line-height: 22px;
          color: var(--color-text);
          height: 48px;
          background: var(--color-surface);
          border-radius: 999px;
          transition: all 0.3s;
          border: 1px solid var(--color-border);
          padding: 0 20px;

          input {
            font-size: 16px;
            width: 100%;
            height: 100%;
            background: transparent;
            border: none;
            outline: none;
            caret-color: var(--color-primary);
            color: var(--color-text);
          }

          &:focus-within {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(100, 102, 241, 0.1);
          }
        }

        .submit {
          margin-top: 24px;
          height: 48px;
          background: var(--color-primary);
          color: #fff;
          border: none;
          border-radius: 999px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;

          &:not(:disabled) {
            opacity: 1;
          }

          &:hover:not(:disabled) {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(100, 102, 241, 0.3);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }

          &:disabled {
            cursor: not-allowed;
            background: var(--color-border);
            color: var(--color-textSecondary);
          }
        }

        .err-msg {
          margin-top: 9.5px;
          height: 16px;
          line-height: 16px;
          color: var(--color-error);
          font-size: 14px;
          font-weight: 400;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

      .oauth-tip:after,
      .oauth-tip:before {
        display: block;
        width: 133px;
        height: 1px;
        content: "";
        background-color: rgba(0, 0, 0, 0.08);
      }

      .oauth-tip-line {
        margin: 0 12px;
      }

      .oauth-tip {
        margin-top: 29px;
        display: flex;
        align-items: center;
        font-weight: 400;
        font-size: 14px;
        color: rgba(51, 51, 51, 0.6);
      }

      .login {
        display: flex;
        margin-top: 16px;

        .login-common {
          width: 144px;
          height: 40px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 999px;
          color: rgba(51, 51, 51, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-right: 10px;

          .reg {
            margin-left: 16px;
          }
        }
      }
    }
  }
}
</style>