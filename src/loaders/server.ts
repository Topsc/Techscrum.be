import config from '../app/config/app';

module.exports = (app:any) => {
  app.listen(config.port, () => {
  // eslint-disable-next-line no-console
    console.log(`⚡️[server]: Server is running at http://localhost:${config.port}`);
  }).on('error', (e:any) => {
  // eslint-disable-next-line no-console
    console.log('Error', e);
  });
};