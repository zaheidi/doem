const db = wx.cloud.database();

Page({
  data: {
    isEdit: false, // 标识当前是否为编辑模式
    jobId: '', // 存储正在编辑的职位ID
    // 表单数据初始状态
    formData: {
      title: '',
      salary: '',
      company: '',
      jobDescription: '',
      recommenderComment: '',
      jobLink: '',
      tags: [],
      publisherName: '',
      publisherType: '校友',
      status: '待审核'
    },
    cityPickerVisible: false,
    cityList: ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '线上', '自定义'],
    cityOptions: [
        { label: '北京', value: 0 }, { label: '上海', value: 1 }, { label: '广州', value: 2 },
        { label: '深圳', value: 3 }, { label: '杭州', value: 4 }, { label: '南京', value: 5 },
        { label: '成都', value: 6 }, { label: '武汉', value: 7 }, { label: '西安', value: 8 },
        { label: '线上', value: 9 }, { label: '自定义', value: 10 }
      ],
    selectedCityIndex: null,
    customLocation: '',
    useCustomLocation: false,
    tagOptions: [
      { label: 'Java', value: 'Java', selected: false },
      { label: 'Python', value: 'Python', selected: false },
      { label: 'Vue', value: 'Vue', selected: false },
      { label: 'React', value: 'React', selected: false },
      { label: '小程序', value: '小程序', selected: false },
      { label: '人工智能', value: '人工智能', selected: false }
    ],
    isPublisherDropdownOpen: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        isEdit: true,
        jobId: options.id
      });
      wx.setNavigationBarTitle({ title: '编辑职位信息' });
      this.fetchJobDetail(options.id);
    }
  },

  // 获取原始数据并回写表单
  fetchJobDetail(id) {
    wx.showLoading({ title: '加载中' });
    db.collection('jobs').doc(id).get().then(res => {
      wx.hideLoading();
      const data = res.data;
  
      // ⭐️ 反向查找城市索引
      const cityIdx = this.data.cityList.indexOf(data.location);
      let isCustom = false;
      let customLoc = '';
      let finalIdx = null;
  
      if (cityIdx !== -1 && cityIdx < 10) {
        // 匹配到了预设城市
        finalIdx = cityIdx;
      } else if (data.location) {
        // 没匹配到，说明是自定义地点
        finalIdx = 10;
        isCustom = true;
        customLoc = data.location;
      }
  
      this.setData({
        formData: data, // 填充其他表单项
        selectedCityIndex: finalIdx,
        useCustomLocation: isCustom,
        customLocation: customLoc,
        // 记得同步更新标签的 selected 状态
        tagOptions: this.data.tagOptions.map(t => ({
          ...t,
          selected: data.tags ? data.tags.includes(t.value) : false
        }))
      });
    });
  },

  // Picker 交互逻辑
  // 城市选择确认
onCityPickerConfirm(e) {
    console.log('选择器返回数据：', e.detail);
    
    // TDesign 返回的是数组，例如 [5]
    const [index] = e.detail.value; 
    const idx = parseInt(index);
  
    this.setData({
      selectedCityIndex: idx,
      useCustomLocation: idx === 10, // 索引10对应“自定义”
      cityPickerVisible: false
    });
  },
  
  // 城市选择取消
  onCityPickerCancel() {
    this.setData({ cityPickerVisible: false });
  },
  
  // 点击触发弹窗
  onCityPickerClick() {
    this.setData({ cityPickerVisible: true });
  },

  // 输入处理
  onTitleChange(e) { this.setData({ 'formData.title': e.detail.value }); },
  onSalaryChange(e) { this.setData({ 'formData.salary': e.detail.value }); },
  onCompanyChange(e) { this.setData({ 'formData.company': e.detail.value }); },
  onJobDescriptionChange(e) { this.setData({ 'formData.jobDescription': e.detail.value }); },
  onCustomLocationChange(e) { this.setData({ customLocation: e.detail.value }); },
  onRecommenderCommentChange(e) { this.setData({ 'formData.recommenderComment': e.detail.value }); },
  onJobLinkChange(e) { this.setData({ 'formData.jobLink': e.detail.value }); },
  onPublisherNameChange(e) { this.setData({ 'formData.publisherName': e.detail.value }); },

  // 标签选择
  onTagSelect(e) {
    const tagValue = e.currentTarget.dataset.tag;
    const { tagOptions, formData } = this.data;
    const index = tagOptions.findIndex(item => item.value === tagValue);
    if (index !== -1) {
      if (tagOptions[index].selected) {
        tagOptions[index].selected = false;
        const tags = formData.tags.filter(tag => tag !== tagValue);
        this.setData({ 'formData.tags': tags, tagOptions });
      } else if (formData.tags.length < 5) {
        tagOptions[index].selected = true;
        this.setData({ 'formData.tags': [...formData.tags, tagValue], tagOptions });
      }
    }
  },

  // 身份下拉
  togglePublisherDropdown() { this.setData({ isPublisherDropdownOpen: !this.data.isPublisherDropdownOpen }); },
  onPublisherTypeSelect(e) {
    this.setData({ 'formData.publisherType': e.currentTarget.dataset.value, isPublisherDropdownOpen: false });
  },
  onTap() { if (this.data.isPublisherDropdownOpen) this.setData({ isPublisherDropdownOpen: false }); },

  // 核心：提交审核逻辑
  onSubmit() {
    const { isEdit, jobId, formData, useCustomLocation, customLocation, cityList, selectedCityIndex } = this.data;
    
    // 1. 位置信息校验
    let finalLocation = '';
    if (selectedCityIndex === null) return this.showError('请选择工作城市');
    if (useCustomLocation) {
      if (!customLocation.trim()) return this.showError('请输入自定义地点');
      finalLocation = customLocation;
    } else {
      finalLocation = cityList[selectedCityIndex];
    }

    // 2. 表单必填校验
    if (!formData.title || !formData.salary || !formData.jobDescription || !formData.company) {
      return this.showError('请完善必填信息');
    }

    wx.showLoading({ title: '提交中' });

    // 3. 构建提交的数据包
    const submitData = {
      ...formData,
      location: finalLocation,
      status: '待审核',        // 只要提交/修改，一律变为待审核
      rejectReason: '',       // 重置驳回理由
      updateTime: db.serverDate()
    };

    if (isEdit) {
      // 编辑模式：更新旧数据
      db.collection('jobs').doc(jobId).update({
        data: submitData
      }).then(() => this.onSuccess()).catch(err => this.handleError(err));
    } else {
      // 新增模式：添加新数据
      db.collection('jobs').add({
        data: {
          ...submitData,
          createTime: db.serverDate(),
          likeCount: 0,
          viewCount: 0
        }
      }).then(() => this.onSuccess()).catch(err => this.handleError(err));
    }
  },

  onSuccess() {
    wx.hideLoading();
    wx.showToast({ title: '已提交审核', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 1500);
  },

  handleError(err) {
    wx.hideLoading();
    console.error(err);
    wx.showToast({ title: '提交失败', icon: 'none' });
  },

  showError(msg) { wx.showToast({ title: msg, icon: 'none' }); }
});