package com.example.infrastructure_service.client;

import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisService {
  private final RedisTemplate<String, Object> redisTemplate;

  public void pushKeyId(String scheduleId, String keyId) {
    redisTemplate.opsForSet().add(scheduleId, keyId);
  }

  public boolean checkKeyIdExists(String scheduleId, String keyId) {
    Boolean exists = redisTemplate.opsForSet().isMember(scheduleId, keyId);
    return exists != null && exists;
  }

  public Set<Object> getKeyIds(String scheduleId) {
    return redisTemplate.opsForSet().members(scheduleId);
  }

  public void deleteScheduleId(String scheduleId) {
    redisTemplate.delete(scheduleId);
  }
}
