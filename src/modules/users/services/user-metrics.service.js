const User = require('../models/user.model');
const Post = require('../../posts/models/post.model');
const Contact = require('../../contacts/models/contact.model');

class UserMetricsService {
  
  /**
   * Obtener métricas completas de un usuario
   */
  async getUserMetrics(userId) {
    try {
      // Ejecutar todas las consultas en paralelo para mejor rendimiento
      const [
        basicMetrics,
        engagementMetrics,
        activityMetrics,
        socialMetrics
      ] = await Promise.all([
        this.getBasicMetrics(userId),
        this.getEngagementMetrics(userId),
        this.getActivityMetrics(userId),
        this.getSocialMetrics(userId)
      ]);

      return {
        basic: basicMetrics,
        engagement: engagementMetrics,
        activity: activityMetrics,
        social: socialMetrics,
        summary: {
          totalScore: this.calculateTotalScore(basicMetrics, engagementMetrics, activityMetrics, socialMetrics),
          rank: 'Standard', // Implementar ranking posteriormente
          badges: this.getBadges(basicMetrics, engagementMetrics, activityMetrics, socialMetrics)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Métricas básicas del perfil
   */
  async getBasicMetrics(userId) {
    try {
      // Contar posts del usuario
      const totalPosts = await Post.countDocuments({ authorId: userId });
      
      // Contar posts por tipo
      const postsByType = await Post.aggregate([
        { $match: { authorId: userId } },
        { $group: { _id: '$postType', count: { $sum: 1 } } }
      ]);

      // Obtener fecha del primer post
      const firstPost = await Post.findOne({ authorId: userId }).sort({ createdAt: 1 });
      const memberSince = firstPost ? firstPost.createdAt : new Date();

      return {
        totalPosts,
        postsByType: postsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        memberSince,
        daysActive: Math.floor((new Date() - memberSince) / (1000 * 60 * 60 * 24))
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Métricas de engagement (reacciones y comentarios)
   */
  async getEngagementMetrics(userId) {
    try {
      // Obtener engagement recibido en posts del usuario
      const engagementReceived = await Post.aggregate([
        { $match: { authorId: userId } },
        {
          $group: {
            _id: null,
            totalReactions: { $sum: { $size: '$reactions' } },
            totalComments: { $sum: { $size: '$comments' } },
            avgReactionsPerPost: { $avg: { $size: '$reactions' } },
            avgCommentsPerPost: { $avg: { $size: '$comments' } }
          }
        }
      ]);

      const received = engagementReceived[0] || {
        totalReactions: 0,
        totalComments: 0,
        avgReactionsPerPost: 0,
        avgCommentsPerPost: 0
      };

      // Obtener engagement dado por el usuario
      const [userReactions, userComments] = await Promise.all([
        Post.countDocuments({ 'reactions.userId': userId }),
        Post.countDocuments({ 'comments.userId': userId })
      ]);

      return {
        received: {
          totalReactions: received.totalReactions,
          totalComments: received.totalComments,
          avgReactionsPerPost: Math.round(received.avgReactionsPerPost * 100) / 100,
          avgCommentsPerPost: Math.round(received.avgCommentsPerPost * 100) / 100
        },
        given: {
          totalReactions: userReactions,
          totalComments: userComments
        },
        engagementScore: this.calculateEngagementScore(received, userReactions, userComments)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Métricas de actividad temporal
   */
  async getActivityMetrics(userId) {
    try {
      // Actividad en los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentActivity = await Post.aggregate([
        { 
          $match: { 
            authorId: userId, 
            createdAt: { $gte: thirtyDaysAgo } 
          } 
        },
        {
          $group: {
            _id: { $dayOfMonth: '$createdAt' },
            posts: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Actividad por día de la semana
      const activityByWeekday = await Post.aggregate([
        { $match: { authorId: userId } },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            posts: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      return {
        last30Days: recentActivity.reduce((acc, item) => {
          acc[item._id] = item.posts;
          return acc;
        }, {}),
        byWeekday: activityByWeekday.reduce((acc, item) => {
          const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          acc[days[item._id - 1]] = item.posts;
          return acc;
        }, {}),
        mostActiveDay: this.getMostActiveDay(activityByWeekday)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Métricas sociales (seguidores, seguidos)
   */
  async getSocialMetrics(userId) {
    try {
      const [followers, following] = await Promise.all([
        Contact.countDocuments({ followeeId: userId }),
        Contact.countDocuments({ followerId: userId })
      ]);

      // Obtener seguidores mutuos
      const mutualFollows = await Contact.aggregate([
        { $match: { followerId: userId } },
        {
          $lookup: {
            from: 'contacts',
            localField: 'followeeId',
            foreignField: 'followerId',
            as: 'mutualCheck'
          }
        },
        {
          $match: {
            'mutualCheck.followeeId': userId
          }
        },
        { $count: 'mutualCount' }
      ]);

      const mutualFollowsCount = mutualFollows[0]?.mutualCount || 0;

      return {
        followers,
        following,
        mutualFollows: mutualFollowsCount,
        followRatio: following > 0 ? Math.round((followers / following) * 100) / 100 : 0,
        socialScore: this.calculateSocialScore(followers, following, mutualFollowsCount)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calcular score de engagement
   */
  calculateEngagementScore(received, userReactions, userComments) {
    const totalReceived = received.totalReactions + received.totalComments;
    const totalGiven = userReactions + userComments;
    
    // Score basado en engagement recibido y participación
    const receivedScore = Math.min(totalReceived * 0.1, 50); // Max 50 puntos
    const participationScore = Math.min(totalGiven * 0.05, 25); // Max 25 puntos
    
    return Math.round(receivedScore + participationScore);
  }

  /**
   * Calcular score social
   */
  calculateSocialScore(followers, following, mutualFollows) {
    const followersScore = Math.min(followers * 0.2, 40); // Max 40 puntos
    const mutualScore = mutualFollows * 0.5; // 0.5 por seguidor mutuo
    const balanceScore = following > 0 ? Math.min((followers / following) * 10, 20) : 0;
    
    return Math.round(followersScore + mutualScore + balanceScore);
  }

  /**
   * Calcular score total
   */
  calculateTotalScore(basic, engagement, activity, social) {
    const postScore = Math.min(basic.totalPosts * 2, 50); // Max 50 puntos
    const engagementScore = engagement.engagementScore || 0;
    const socialScore = social.socialScore || 0;
    const longevityScore = Math.min(basic.daysActive * 0.1, 25); // Max 25 puntos
    
    return Math.round(postScore + engagementScore + socialScore + longevityScore);
  }

  /**
   * Obtener badges basados en métricas
   */
  getBadges(basic, engagement, activity, social) {
    const badges = [];
    
    // Badges por posts
    if (basic.totalPosts >= 100) badges.push('Prolífico');
    if (basic.totalPosts >= 50) badges.push('Activo');
    if (basic.totalPosts >= 10) badges.push('Contributor');
    
    // Badges por engagement
    if (engagement.received.totalReactions >= 500) badges.push('Influencer');
    if (engagement.received.totalReactions >= 100) badges.push('Popular');
    
    // Badges por actividad social
    if (social.followers >= 100) badges.push('Líder');
    if (social.followers >= 50) badges.push('Conectado');
    if (social.mutualFollows >= 20) badges.push('Sociable');
    
    // Badges por longevidad
    if (basic.daysActive >= 365) badges.push('Veterano');
    if (basic.daysActive >= 180) badges.push('Experimentado');
    if (basic.daysActive >= 30) badges.push('Establecido');
    
    return badges;
  }

  /**
   * Obtener día más activo
   */
  getMostActiveDay(activityByWeekday) {
    if (!activityByWeekday || activityByWeekday.length === 0) return null;
    
    const maxActivity = activityByWeekday.reduce((max, current) => 
      current.posts > max.posts ? current : max
    );
    
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[maxActivity._id - 1];
  }

  /**
   * Obtener métricas resumidas para mostrar en perfil
   */
  async getProfileSummary(userId) {
    try {
      const [totalPosts, followers, following, totalEngagement] = await Promise.all([
        Post.countDocuments({ authorId: userId }),
        Contact.countDocuments({ followeeId: userId }),
        Contact.countDocuments({ followerId: userId }),
        Post.aggregate([
          { $match: { authorId: userId } },
          {
            $group: {
              _id: null,
              totalEngagement: { 
                $sum: { 
                  $add: [
                    { $size: '$reactions' },
                    { $size: '$comments' }
                  ] 
                } 
              }
            }
          }
        ])
      ]);

      return {
        totalPosts,
        followers,
        following,
        totalEngagement: totalEngagement[0]?.totalEngagement || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserMetricsService(); 