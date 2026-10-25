package com.subrahmanyapg.task.domain;

import com.subrahmanyapg.task.domain.entity.TaskPriority;
import com.subrahmanyapg.task.domain.entity.TaskStatus;

import java.time.LocalDate;

public record UpdateTaskRequest(
        String title,
        String description,
        LocalDate dueDate,
        TaskStatus status,
        TaskPriority priority
) {

}
