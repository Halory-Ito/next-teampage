# 引言

昨天看随意直播间的时候，提到她的一个下属写了一个文件上传功能写了两周，虽然现在有AI来写的话，肯定很快。想到当初学文件上传的时候还懵懵懂懂，决定对这方面的知识再整理一下

# 基础上传

最早、最朴素的方式：一个 `<form>` + `<input type="file">`，提交时浏览器自动把表单编码成 `multipart/form-data` 发到 `action` 指向的地址。

```html
<form action="/api/upload" method="post" enctype="multipart/form-data">
  <input type="file" onChange="{handleChange}" name="file" multiple />
  <button type="submit">上传</button>
</form>
```

其中可以对`input`绑定`onChange`事件，进行额外的判断操作

```ts
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files[0]
  // 文件大小
  if (file.size > 10 * 1024 * 1024) {
    alert('不能超过 10 MB')
  }
  // 文件类型
  if (file.type !== 'application/pdf') {
    alert('只能上传 PDF 文件')
  }
}
```

不过对于文件类型的限制，最好还是直接传入`accept`属性最佳：

```html
<input accept="image/png,image/jpeg,application/pdf" />
```

这种基础上的上传有如下缺点：

- `method` 必须是 `post`；
- **`enctype="multipart/form-data"` 不能省略**，否则文件内容不会被编码进去（默认的 `application/x-www-form-urlencoded` 只适合文本）；
- 缺点：提交后整页跳转/刷新，看不到进度，失败体验差
