// File: app/login/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);


  useEffect(() => {

    if (!loading && user) {
      router.replace('/products');
    }
  }, [user, loading, router]);

  const onFinish = async (values: any) => {
    setError(null);
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password)
    } catch (error: any) {
      console.error("Login failed:", error);
      setError("Email atau password salah. Silakan coba lagi.");
    } finally {
      setIsLoggingIn(false);
    }
  };
  if (loading || user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <div style={{ width: 400, padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Login
        </Title>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'The input is not valid E-mail!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          {error && (
            <Form.Item>
              <Alert message={error} type="error" showIcon />
            </Form.Item>
          )}
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%' }}
              loading={isLoggingIn}
            >
              Log In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}