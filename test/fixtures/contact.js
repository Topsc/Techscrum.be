const invalidForm = {
  fullName: 'zhou test',
  company: 'testing company',
  phone: '9876543',
  email: 'egglord@example.com',
  message: 'hello i am testing from insomina👻',
  title: "I'm confused about how something works",
};

const validForm = {
  fullName: 'zhou test',
  company: 'testing company',
  phone: '9876543210',
  email: 'egglord@example.com',
  message: 'hello i am pass test from jest unit test👻',
  title: "I'm confused about how something works",
};

module.exports = {
  invalidForm,
  validForm,
};
