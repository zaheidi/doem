Page({
    data: {
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
        reviewerName: '待审核'
      },
      cityPickerVisible: false, // 控制选择器显隐
      cancelText: '取消', // 直接用字符串
      confirmText: '确定',
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
  
    // Picker 交互逻辑
    onCityPickerClick() { this.setData({ cityPickerVisible: true }); },
    onCityPickerCancel() { this.setData({ cityPickerVisible: false }); },
    onCityPickerConfirm(e) {
      const idx = parseInt(e.detail.value[0]);
      this.setData({
        selectedCityIndex: idx,
        useCustomLocation: idx === 10,
        cityPickerVisible: false
      });
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
  
    // 提交审核
    onSubmit() {
      const { formData, useCustomLocation, customLocation, cityList, selectedCityIndex } = this.data;
      let finalLocation = '';
      if (selectedCityIndex === null) return this.showError('请选择工作城市');
      if (useCustomLocation) {
        if (!customLocation.trim()) return this.showError('请输入自定义地点');
        finalLocation = customLocation;
      } else {
        finalLocation = cityList[selectedCityIndex];
      }
  
      if (!formData.title || !formData.salary || !formData.jobDescription || !formData.company) {
        return this.showError('请完善必填信息');
      }
  
      wx.showLoading({ title: '提交中' });
      const db = wx.cloud.database();
      db.collection('jobs').add({
        data: {
          ...formData,
          location: finalLocation,
          createTime: db.serverDate(),
          status: '待审核'
        }
      }).then(() => {
        wx.hideLoading();
        wx.showToast({ title: '已提交审核', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1500);
      }).catch(err => {
        wx.hideLoading();
        console.error(err);
      });
    },
  
    showError(msg) { wx.showToast({ title: msg, icon: 'none' }); }
  });