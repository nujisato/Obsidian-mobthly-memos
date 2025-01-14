---
title: <% tp.file.title %>
date: <% tp.file.creation_date("YYYY-MM-DD HH:mm") %>
tags:
  - Dailynote
---
# Schedule

<%*
const day = new moment(tp.date.now()).startOf('month')
const end = day.clone().add(day.daysInMonth(), 'days')
for (; day.diff(end, 'days') < 0; day.add(1, 'days')) { %>
<% day.format("# YYYY-MM-DD") %>
- 曜日：<% day.format("dd") %> 
<%* } %>
# This month in review