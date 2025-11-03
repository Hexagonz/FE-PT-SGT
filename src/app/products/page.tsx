'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Pagination,
  Space,
  Typography,
  InputNumber,
  notification,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { Product } from '../@types/DataInterface';

const { Search } = Input;
const { Title } = Typography;

type ModalType = 'create' | 'edit';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function ProductPage() {
  const [form] = Form.useForm();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(5);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('create');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchProducts = async (page: number, search: string) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products', {
        params: {
          page: page,
          limit: limit,
          search: search,
        },
      });

      const { data, pagination } = response.data;

      setProducts(data);
      setTotalProducts(pagination.total);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Gagal mengambil data produk.',
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  const handleOpenCreateModal = () => {
    setModalType('create');
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleOpenEditModal = (record: Product) => {
    setModalType('edit');
    setEditingProduct(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleCancelModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
  };

  const onFinish = async (values: any) => {
    setModalLoading(true);
    try {
      if (modalType === 'create') {
        await axios.post('/api/product', values);
        notification.success({ message: 'Produk berhasil ditambahkan' });
      } else if (modalType === 'edit' && editingProduct) {
        await axios.put('/api/product', {
          ...editingProduct,
          ...values,
        });
        notification.success({ message: 'Produk berhasil diupdate' });
      }

      setModalVisible(false);
      fetchProducts(currentPage, debouncedSearchTerm);
    } catch (error) {
      notification.error({ message: 'Terjadi kesalahan' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      setLoading(true);
      await axios.delete('/api/product', {
        params: { product_id: productId },
      });
      notification.success({ message: 'Produk berhasil dihapus' });
      fetchProducts(currentPage, debouncedSearchTerm);
    } catch (error) {
      notification.error({ message: 'Gagal menghapus produk' });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'Product Title',
      dataIndex: 'product_title',
      key: 'title',
    },
    {
      title: 'Price',
      dataIndex: 'product_price',
      key: 'price',
      render: (price: number) =>
        `Rp ${price.toLocaleString('id-ID')}`,
    },
    {
      title: 'Category',
      dataIndex: 'product_category',
      key: 'category',
    },
    {
      title: 'Description',
      dataIndex: 'product_description',
      key: 'description',
      render: (text: string) => text?.length > 50 ? `${text.substring(0, 50)}...` : text,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleOpenEditModal(record)}>Edit</Button>
          {/* <Button danger onClick={() => handleDelete(record.product_id)}>
            Delete
          </Button> */}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Product Management</Title>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Search
            placeholder="Search by title, description, category..."
            onSearch={(value: any) => setSearchTerm(value)}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            style={{ width: 400 }}
          />
          <Button type="primary" onClick={handleOpenCreateModal}>
            Create Product
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={products}
          loading={loading}
          rowKey="product_id"
          pagination={false}
        />

        <Pagination
          current={currentPage}
          total={totalProducts}
          pageSize={limit}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          style={{ textAlign: 'right' }}
        />

      </Space>

      <Modal
        title={modalType === 'create' ? 'Create New Product' : 'Edit Product'}
        open={modalVisible}
        onCancel={handleCancelModal}
        onOk={() => form.submit()}
        confirmLoading={modalLoading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            product_title: '',
            product_price: 0,
            product_description: '',
            product_category: '',
            product_image: '',
          }}
        >
          <Form.Item
            name="product_title"
            label="Product Title"
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="product_price"
            label="Price"
            rules={[{ required: true, message: 'Price is required' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="product_description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="product_category"
            label="Category"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="product_image"
            label="Image URL"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}