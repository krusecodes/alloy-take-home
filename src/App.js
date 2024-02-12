import React, { useEffect, useState } from 'react'; // Import useState
import { Button, Form, Input, Space, message } from 'antd';
import { alloyToken } from './utils/alloy';
import './App.css';

const Alloy = require('alloy-frontend');
const alloy = Alloy();

function App() {
  const [vendor, setVendor] = useState([]);
  const [connectionId, setConnectionId] = useState('');

  alloy.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY1YzkwZWE3NzkwYWEwMWI3ZTgwNTQzMiJ9LCJpYXQiOjE3MDc3MTQ0NzIsImV4cCI6MTcwNzcxODA3Mn0.EGkf7_ojUqrpeDPDQ6lh-rbLuCjpKiGimlJaW0_Drxc');

  useEffect(() => {
    if (window.Alloy) {
      window.Alloy.setToken(alloyToken);
    } else {
      console.error('Alloy SDK is not loaded');
    }
  }, []);

  const fetchVendors = async (connectionId) => {
    fetch(`https://embedded.runalloy.com/2023-12/one/accounting/vendors?connectionId=${connectionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `bearer ${process.env.REACT_APP_ALLOY_API_KEY}`,
        'accept': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          // If the response is not ok, throw an error
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON response
      })
      .then(data => {
        console.log('fetchVendors', data); // Log the data to the console
        setVendor(data.vendors);
      })
      .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
      });
  }

  console.log(vendor);

  const postVendor = (values) => {
    const { vendorName } = values;
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: 'bearer rqnd6bZYU2I5PDrsJ5I4h',
        'content-type': 'application/json'
      },
      // body: JSON.stringify({vendorName: `${vendorName}`})
      body: JSON.stringify({ vendorName })
    };
    console.log(connectionId);
    fetch(`https://embedded.runalloy.com/2023-12/one/accounting/vendors?connectionId=${connectionId}`, options)
      .then(response => response.json())
      .then(response => console.log(response))
      .then(response => {
        console.log('Vendor added:', response);
        fetchVendors(connectionId);
      })
      .catch(err => console.error(err));
      fetchVendors()
  }

  const handleAuthenticate = async () => {
    try {
      if (window.Alloy) {
        alloy.authenticate({
          appName: "quickbooks",
          callback: (data) => {
            console.log('authentication', data);
            setConnectionId(data.connectionId);
            fetchVendors(data.connectionId);
          },
          title: "My Cool QuickBooks Integration"
        });
        console.log('test', test)
      }
    } catch (error) {
      console.error("Alloy SDK is not loaded");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Submission failed');
  };

  return (
    <div className="App">
      <Space direction="vertical" style={{ marginBottom: 20 }}>
        <Button onClick={handleAuthenticate}>Connect Alloy</Button>
        <Form
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={postVendor}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Vendor Name"
            name="vendorName"
            rules={[
              {
                required: true,
                message: 'Please input your vendor name!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Submit Expense
            </Button>
          </Form.Item>
        </Form>
        <table>
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vendor.map((vendor) => (
              <tr key={vendor.id}>
                <td>{vendor.vendorName}</td>
                <td>{vendor.id}</td>
                <td>{vendor.vendorStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Space>
    </div>
  );
}

export default App;
