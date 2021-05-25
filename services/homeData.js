const posts = [{
  id: 1,
  title: 'node mvc ',
}, {
  id: 2,
  title: 'node mvc',
}];

class HomeData {
  async getList() {
    return "hello mvc";
  }
}

module.exports = HomeData;