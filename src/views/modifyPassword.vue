<template>
	<div class="modify-container">
		<div class="page-header">
			<el-button class="back-btn" :icon="ArrowLeft" @click="goBack">返回</el-button>
			<h1 class="page-title">修改密码</h1>
		</div>

		<div class="form-wrapper">
			<el-card shadow="hover" class="form-card">
				<template #header>
					<div class="card-header">
						<div>
							<p class="card-title">保护你的账号</p>
							<p class="card-subtitle">请先验证原密码，再设置新密码</p>
						</div>
					</div>
				</template>

				<el-form
					ref="formRef"
					:model="form"
					:rules="rules"
					label-width="100px"
					class="password-form"
				>
					<el-form-item label="原密码" prop="originPass">
						<el-input
							v-model="form.originPass"
							type="password"
							show-password
							autocomplete="current-password"
							placeholder="请输入原密码"
						>
							<template #prefix>
								<el-icon><Lock /></el-icon>
							</template>
						</el-input>
					</el-form-item>

					<el-form-item label="新密码" prop="newPass">
						<el-input
							v-model="form.newPass"
							type="password"
							show-password
							autocomplete="new-password"
							placeholder="至少 6 位，建议包含数字和字母"
						>
							<template #prefix>
								<el-icon><Key /></el-icon>
							</template>
						</el-input>
					</el-form-item>

					<el-form-item label="确认新密码" prop="confirmPass">
						<el-input
							v-model="form.confirmPass"
							type="password"
							show-password
							autocomplete="new-password"
							placeholder="再次输入新密码"
						>
							<template #prefix>
								<el-icon><CircleCheck /></el-icon>
							</template>
						</el-input>
					</el-form-item>

					<div class="form-actions">
						<el-button @click="resetForm">重置</el-button>
						<el-button type="primary" :loading="submitting" @click="submitForm">
							保存并重新登录
						</el-button>
					</div>
				</el-form>
			</el-card>
		</div>
	</div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Lock, Key, CircleCheck } from '@element-plus/icons-vue'
import { checkoriginPass, EditPassword } from '../api/account'
import local from '../utils/local'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
	originPass: '',
	newPass: '',
	confirmPass: ''
})

const validateConfirm = (rule, value, callback) => {
	if (!value) {
		callback(new Error('请确认新密码'))
	} else if (value !== form.newPass) {
		callback(new Error('两次输入的新密码不一致'))
	} else {
		callback()
	}
}

const validateNewPass = (rule, value, callback) => {
	if (!value) {
		callback(new Error('请输入新密码'))
		return
	}
	if (value.length < 6) {
		callback(new Error('新密码至少 6 位'))
		return
	}
	if (value === form.originPass) {
		callback(new Error('新密码不能与原密码相同'))
		return
	}
	callback()
}

const rules = {
	originPass: [
		{ required: true, message: '请输入原密码', trigger: 'blur' }
	],
	newPass: [
		{ validator: validateNewPass, trigger: ['blur', 'change'] }
	],
	confirmPass: [
		{ validator: validateConfirm, trigger: ['blur', 'change'] }
	]
}

const submitForm = () => {
	formRef.value?.validate(async (valid) => {
		if (!valid) return
		submitting.value = true
		try {
			const originRes = await checkoriginPass({ originPass: form.originPass })
			if (originRes.code !== 0) {
				ElMessage.error(originRes.reason || '原密码错误')
				return
			}

			const res = await EditPassword({ newPass: form.newPass })
			if (res.code === 0) {
				ElMessage.success(res.reason || '修改成功，请重新登录')
				local.remove('user_token')
				router.push('/login')
			} else {
				ElMessage.error(res.reason || '修改密码失败')
			}
		} catch (error) {
			console.error('修改密码失败', error)
			ElMessage.error('修改密码失败')
		} finally {
			submitting.value = false
		}
	})
}

const resetForm = () => {
	formRef.value?.resetFields()
}

const goBack = () => {
	router.back()
}
</script>

<style lang="scss" scoped>
.modify-container {
	min-height: 100vh;
	padding: 32px 16px 48px;
	background: radial-gradient(circle at 20% 20%, #0ba360 0%, rgba(11, 163, 96, 0.15) 25%),
		radial-gradient(circle at 80% 0%, #3cba92 0%, rgba(60, 186, 146, 0.05) 30%),
		linear-gradient(135deg, #0c2d48 0%, #0b5345 100%);
	font-family: 'Manrope', 'Segoe UI', sans-serif;
	color: #0c1b26;

	.page-header {
		max-width: 960px;
		margin: 0 auto 24px;
		display: flex;
		align-items: center;
		gap: 14px;

		.back-btn {
			background: rgba(255, 255, 255, 0.9);
			border: none;
			color: #0c2d48;
			box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
			transition: all 0.2s ease;

			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 12px 34px rgba(0, 0, 0, 0.18);
			}
		}

		.page-title {
			margin: 0;
			font-size: 28px;
			font-weight: 700;
			color: #e8f5e9;
			letter-spacing: 0.5px;
			text-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
		}
	}

	.form-wrapper {
		display: flex;
		justify-content: center;
	}

	.form-card {
		width: 100%;
		max-width: 720px;
		border: 1px solid rgba(255, 255, 255, 0.18);
		border-radius: 18px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.96);
		box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);

		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 4px;

			.card-title {
				margin: 0;
				font-size: 20px;
				font-weight: 700;
				color: #0c2d48;
			}

			.card-subtitle {
				margin: 4px 0 0;
				color: #52796f;
				font-size: 14px;
			}
		}

		.password-form {
			padding: 12px 8px 0;

			.el-form-item {
				margin-bottom: 22px;
			}
		}

		.form-actions {
			display: flex;
			justify-content: flex-end;
			gap: 12px;
			padding: 6px 8px 4px;
		}
	}
}
</style>
