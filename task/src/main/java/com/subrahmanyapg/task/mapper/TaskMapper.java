package com.subrahmanyapg.task.mapper;

import com.subrahmanyapg.task.domain.CreateTaskRequest;
import com.subrahmanyapg.task.domain.UpdateTaskRequest;
import com.subrahmanyapg.task.domain.dto.CreateTaskRequestDto;
import com.subrahmanyapg.task.domain.dto.TaskDto;
import com.subrahmanyapg.task.domain.dto.UpdateTaskRequestDto;
import com.subrahmanyapg.task.domain.entity.Task;

public interface TaskMapper {

    CreateTaskRequest fromDto(CreateTaskRequestDto dto);

    UpdateTaskRequest fromDto(UpdateTaskRequestDto dto);

    TaskDto toDto(Task task);

}
